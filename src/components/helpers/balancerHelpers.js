import { feeFactor, ratioFactor } from './factorCalcs';
import React from 'react';

const colors = [
	'darkorange',
	'teal',
	'forestgreen',
	'crimson',
	'orchid',
	'steelblue',
	'lightslategray',
	'darkmagenta'
];

const tokenAddresses = [
	'0xba100000625a3754423978a60c9317c58a424e3d',
	'0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
	'0x4ddc2d193948926d02f9b1fe9e1daa0718270ed5',
	'0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
	'0x39aa39c021dfbae8fac545936693ac917d5e7563',
	'0xe2f2a5c287993345a840db3b0845fbc70f5935a5',
	'0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
	'0x6b175474e89094c44da98b954eedeac495271d0f',
	'0x5d3a536e4d6dbd6114cc1ead35777bab948e3643',
	'0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
	'0xC11b1268C1A384e55C48c2391d8d480264A3A7F4',
	'0xb4efd85c19999d84251304bda99e90b92300bd93',
	'0x1985365e9f78359a9b6ad760e32412f4a445e862',
	'0x80fb784b7ed66730e8b1dbd9820afd29931aab03',
	'0x57ab1ec28d129707052df4df418d58a2d46d5f51',
	'0x5e74c9036fb86bd7ecdcb084a0673efc32ea31cb',
	'0x04fa0d235c4abf4bcf4787af4cf447de572ef828',
	'0xc00e94cb662c3520282e6f5717214004a7f26888',
	'0x514910771af9ca656af840dff83e8264ecf986ca',
	'0x408e41876cccdc0f92210600ef50372656052a38',
	'0x8a9c67fee641579deba04928c4bc45f66e26343a',
	'0x9cb2f26a23b8d89973f08c957c4d7cdf75cd341c',
	'0x0327112423f3a68efdf1fcf402f6c5cb9f7c33fd',
	'0x0d8775f648430679a709e98d2b0cb6250d2887ef',
	'0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f'
];
const tokenColors = [
	'white', //BAL
	'pink', //WETH
	'pink', //CETH
	'olive', //USDC
	'olive', //CUSDC
	'goldenrod', //mUSD
	'aquamarine', //MKR
	'yellow', //DAI
	'yellow', //CDAI
	'blue', //WBTC
	'blue', //CWBTC
	'palegreen', //RPL
	'rgb(57%, 39%, 34%)', // REP
	'rgb(4%, 68%, 80%)', //LEND
	'rgb(43%, 52%, 56%)', // sUSD
	'rgb(36%, 38%, 89%)', //sETH
	'rgb(73%, 74%, 6%)', //UMA
	'rgb(81%, 20%, 1%)', //COMP
	'rgb(62%, 62%, 46%)', //LINK
	'rgb(96%, 89%, 64%)', //REN
	'rgb(1%, 51%, 32%)', //JRT
	'rgb(56%, 46%, 71%)', //DZAR
	'rgb(100%, 43%, 34%)', //BTC++
	'rgb(12%, 32%, 10%)', //BAT
	'rgb(86%, 34%, 36%)' //SNX
];
export const renderAssetsText = (pool) => {
	const assets = [];
	const colorPick = [];
	pool.tokens.forEach((token, index) => {
		if (tokenAddresses.indexOf(token.address) !== -1)
			colorPick.push(tokenColors[tokenAddresses.findIndex((value) => value === token.address)]);
		else colorPick.push(colors[index]);
		const weight = token.denormWeight / pool.totalWeight;
		let percentage = (weight * 100).toFixed(2);
		percentage = Number(percentage).toString() + '%';
		assets.push(percentage + ' ' + token.symbol);
	});
	return assets.map((asset, index) => {
		return (
			<span key={Math.random()}>
				<i className={'icon tiny circle'} style={{ color: `${colorPick[index]}` }} />
				{asset}&nbsp;&nbsp;
			</span>
		);
	});
};

export const renderAssets = (pool) => {
	const assets = [];
	pool.tokens.forEach((token, index) => {
		let colorPick;
		if (tokenAddresses.indexOf(token.address) !== -1)
			colorPick = tokenColors[tokenAddresses.findIndex((value) => value === token.address)];
		else colorPick = colors[index];
		const weight = token.denormWeight / pool.totalWeight;
		const percentage = parseFloat((weight * 100).toFixed(2));
		const entry = { title: token.symbol, value: percentage, color: colorPick };
		assets.push(entry);
	});
	return assets;
};

export const renderTotalLiquidity = (pool, prices, ownership = 1) => {
	let total = 0;
	for (let token of pool.tokens) {
		const address = token.address;
		if (prices === undefined || prices[address] === undefined) return 'No Data';
		const price = prices[address].usd;
		const balance = parseFloat(token.balance);
		total += price * balance;
	}
	if (isNaN(total)) return 'No Data';
	total = total * ownership;
	return Number(total.toFixed(2)).toLocaleString();
};

export const renderVolume = (pool, ownership = 1) => {
	const totalSwapVolume = pool.totalSwapVolume;
	if (pool.swaps[0] === undefined) return 0;
	const swap = pool.swaps[0].poolTotalSwapVolume;
	const volume = (totalSwapVolume - swap) * ownership;
	return Number(volume.toFixed(2)).toLocaleString();
};

export const renderFees = (pool, ownership = 1) => {
	const totalSwapVolume = pool.totalSwapVolume;
	if (pool.swaps[0] === undefined) return 0;
	const swap = pool.swaps[0].poolTotalSwapVolume;
	const volume = totalSwapVolume - swap;
	const fees = volume * pool.swapFee * ownership;
	return Number(fees.toFixed(2)).toLocaleString();
};

const totalFactor = (pool) => {
	const fee = feeFactor(pool.swapFee);
	const ratio = ratioFactor(pool);
	return fee * ratio;
};

export const renderAdjLiquidity = (pool, prices, sumLiq, ownership = 1) => {
	const tFactor = totalFactor(pool);
	const liquidity = renderTotalLiquidity(pool, prices).split(',').join('');
	if (isNaN(liquidity / sumLiq * 14500)) return 0;
	return liquidity * tFactor / sumLiq * 145000 * 52 * ownership;
};

export const renderTotalYield = (pool, prices, sumLiq) => {
	const liquidity = renderTotalLiquidity(pool, prices).split(',').join('');
	if (isNaN(liquidity / sumLiq * 14500)) return 0;
	const annualBAL = renderAdjLiquidity(pool, prices, sumLiq);
	const feeYield = parseFloat(renderYield(pool, prices)) * 365;
	const priceBAL = prices['0xba100000625a3754423978a60c9317c58a424e3d'].usd;
	const yieldBAL = parseFloat(annualBAL * priceBAL / liquidity * 100);
	const totalYield = yieldBAL + feeYield;
	return totalYield.toFixed(2);
};

export const checkLiquidity = (pool, prices) => {
	let total = 0;
	for (let token of pool.tokens) {
		const address = token.address;
		if (prices[address] === undefined) return 0;
		const price = prices[address].usd;
		const balance = parseFloat(token.balance);
		total += price * balance;
	}
	return Number(total.toFixed(2)).toLocaleString();
};
export const renderYield = (pool, prices) => {
	const totalSwapVolume = pool.totalSwapVolume;
	if (pool.swaps[0] === undefined) return '0';
	const swap = pool.swaps[0].poolTotalSwapVolume;
	const volume = totalSwapVolume - swap;
	const fees = volume * pool.swapFee;
	let total = 0;
	for (let token of pool.tokens) {
		const address = token.address;
		if (prices === undefined) return '0';
		const price = prices[address].usd;
		const balance = parseFloat(token.balance);
		total += price * balance;
	}
	const feeYield = fees / total * 100;
	if (isNaN(feeYield)) return '0';
	return feeYield.toFixed(4);
};

export const renderOwnership = (ownership) => {
	if (!ownership) return '-';
	else return (ownership * 100).toFixed(2);
};

export const renderNumLP = (pool, moreShares) => {
	let count = 0;
	for (let share of pool.shares) if (parseInt(share.balance) !== 0) count++;
	for (let anotherPool of moreShares)
		if (anotherPool.id === pool.id)
			for (let share of anotherPool.shares) if (parseInt(share.balance) !== 0) count++;
	if (count === 0) return 1;
	else return count;
};

export const renderLifetimeFees = (pool) => {
	const swapFee = pool.swapFee;
	const totalVolume = pool.totalSwapVolume;
	return Number((totalVolume * swapFee).toFixed(2)).toLocaleString();
};
