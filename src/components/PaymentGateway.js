"use client"; // Ensures this component runs on the client side

import { useState } from "react";
import { ethers } from "ethers";

const PAYMENT_ADDRESS = "0xD01913CcF6B58f900c113c40050754b91cA140A5";
const USDT_ADDRESS = "0x55d398326f99059fF77548524699902783197955"; // USDT on BSC
const USDC_ADDRESS = "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d"; // USDC on BSC
const TOKEN_ABI = [
	"function transfer(address recipient, uint256 amount) public returns (bool)",
	"function balanceOf(address account) public view returns (uint256)",
];

export default function PaymentGateway() {
	const [amount, setAmount] = useState("");
	const [token, setToken] = useState("USDT");
	const [loading, setLoading] = useState(false);

	async function handlePayment() {
		if (!window.ethereum) {
			alert("Please install MetaMask to proceed!");
			return;
		}

		try {
			setLoading(true);
			const provider = new ethers.BrowserProvider(window.ethereum);
			const signer = await provider.getSigner();

			const tokenAddress = token === "USDT" ? USDT_ADDRESS : USDC_ADDRESS;
			const contract = new ethers.Contract(tokenAddress, TOKEN_ABI, signer);

			// Convert amount to wei
			const decimals = 18; // USDT & USDC have 18 decimals on BSC
			const amountInWei = ethers.parseUnits(amount, decimals);

			// Check user balance
			const userBalance = await contract.balanceOf(await signer.getAddress());

			if (userBalance < amountInWei) {
				alert("Payment failed: Insufficient balance!");
				setLoading(false);
				return;
			}

			// Send payment
			const tx = await contract.transfer(PAYMENT_ADDRESS, amountInWei);
			await tx.wait();

			alert("Payment Successful!");
		} catch (error) {
			if (
				error.reason &&
				error.reason.includes("transfer amount exceeds balance")
			) {
				alert("Payment failed: Insufficient balance!");
			} else {
				alert(`Payment failed: ${error.reason || error.message}`);
			}
		} finally {
			setLoading(false);
		}
	}

	return (
		<div style={{ textAlign: "center", padding: "20px" }}>
			<h2>Crypto Payment Gateway</h2>
			<select value={token} onChange={(e) => setToken(e.target.value)}>
				<option value="USDT">USDT</option>
				<option value="USDC">USDC</option>
			</select>
			<input
				type="number"
				placeholder="Enter Amount"
				value={amount}
				onChange={(e) => setAmount(e.target.value)}
				style={{ margin: "10px", padding: "5px" }}
			/>
			<button onClick={handlePayment} disabled={loading}>
				{loading ? "Processing..." : "Pay"}
			</button>
		</div>
	);
}
