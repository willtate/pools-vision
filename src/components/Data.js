import React from 'react';
import { connect } from 'react-redux';
import {
	fetchPools,
	fetchPrice,
	sumLiquidity,
	clearLiquidity,
	deletePrices,
	sumAllLiq,
	deleteAllLiq,
	sumAllVol,
	deleteAllVol,
	deletePools,
	fetchPool,
	addShares,
	deleteShares,
	removePools,
	addCaps,
	removeCaps,
	sumFinal,
	deleteFinal
} from '../actions';
import { renderTotalLiquidity, totalFactor, renderRealAdj } from './helpers/balancerHelpers';

class Data extends React.Component {
	constructor(props) {
		super(props);
		this.timer = null;
		this.sumTotalAdjLiq = 0;
		this.sumTotalLiq = 0;
		this.sumVolume = 0;
		this.sumFinalLiq = 0;
		this.refreshTimer = 300000;
		this.tokenAdjBalance = [];
		this.addresses = [];
		this.tokenNames = [];
	}
	componentDidMount() {
		this.gatherData();
	}

	async gatherData() {
		await this.props.fetchPools(0);
		for (let i = 1; i < 100; i++) {
			if (this.props.pools.length > 999 * i) await this.props.fetchPools(i);
		}
		const tokenTotalBalance = [];
		for (const pool of this.props.pools) {
			if (pool.shares.length > 990) {
				await this.props.addShares(pool, 1);
			}
			for (const token of pool.tokens) {
				if (this.addresses.indexOf(token.address) === -1) this.addresses.push(token.address);
				const index = this.addresses.indexOf(token.address);
				if (!tokenTotalBalance[index]) tokenTotalBalance[index] = 0;
				tokenTotalBalance[index] += parseFloat(token.balance);
				this.tokenNames[index] = token.symbol;
			}
		}
		const a1 = this.addresses.slice(0, this.addresses.length / 2);
		const a2 = this.addresses.slice(this.addresses.length / 2);
		await this.props.fetchPrice(a1.join(','));
		await this.props.fetchPrice(a2.join(','));
		tokenTotalBalance.forEach((item, index) => {
			const price = this.addresses[index];
			if (!this.props.prices[price]) return;
			tokenTotalBalance[index] = item * this.props.prices[price].usd;
		});
		for (const pool of this.props.pools) {
			this.adjLiquidity(pool);
			this.getTotalVolume(pool);
		}
		const addrs = this.addresses;
		const tokenAdj = this.tokenAdjBalance;
		const names = this.tokenNames;
		const caps = [];
		tokenTotalBalance.forEach((item, index) =>
			caps.push({ addr: addrs[index], name: names[index], total: item, adj: tokenAdj[index] })
		);
		this.props.addCaps(caps);
		this.props.sumAllLiq(this.sumTotalLiq);
		this.props.sumAllVol(this.sumVolume);
		this.props.sumLiquidity(this.sumTotalAdjLiq);
		for (const pool of this.props.pools) this.capLiquidity(pool, caps);
		this.props.sumFinal(this.sumFinalLiq);
		this.timer = setInterval(() => {
			this.refreshData();
		}, this.refreshTimer);
		const checked = [];
		for (let i = 2; i < 999; i++) {
			let exit = true;
			for (let j = 0; j < this.props.moreShares.length; j++) {
				const pool = this.props.moreShares[j];
				if (pool.shares.length > 990 && checked.indexOf(j) === -1) {
					this.props.addShares(pool, i);
					checked.push(j);
					exit = false;
				}
			}
			if (exit) break;
		}
	}

	async refreshData() {
		clearInterval(this.timer);
		this.sumTotalAdjLiq = 0;
		this.sumTotalLiq = 0;
		this.sumVolume = 0;
		this.sumFinalLiq = 0;
		this.tokenAdjBalance = [];
		this.addresses = [];
		this.tokenNames = [];
		this.props.removePools();
		this.props.clearLiquidity();
		this.props.deleteAllLiq();
		this.props.deleteAllVol();
		this.props.deletePrices();
		this.props.deleteShares();
		this.props.deleteFinal();
		this.props.removeCaps();
		if (this.props.portfolioPools && this.props.poolsList) {
			this.props.deletePools();
			for (let pool of this.props.poolsList) await this.props.fetchPool(pool);
		}

		this.gatherData();
	}
	adjLiquidity = (pool) => {
		const totalFac = totalFactor(pool);
		const liquidity = parseFloat(renderTotalLiquidity(pool, this.props.prices));
		if (!isNaN(liquidity)) this.sumTotalLiq += liquidity;
		if (isNaN(liquidity * totalFac)) return;
		const adjLiq = liquidity * totalFac;
		for (const token of pool.tokens) {
			const index = this.addresses.indexOf(token.address);
			if (!this.tokenAdjBalance[index]) this.tokenAdjBalance[index] = 0;
			if (this.props.prices[token.address].usd)
				this.tokenAdjBalance[index] +=
					parseFloat(token.balance) * this.props.prices[token.address].usd * totalFac;
		}
		this.sumTotalAdjLiq += adjLiq;
	};

	capLiquidity = (pool, caps) => {
		this.sumFinalLiq += renderRealAdj(pool, this.props.prices, caps);
	};

	getTotalVolume(pool) {
		const totalSwapVolume = pool.totalSwapVolume;
		if (pool.swaps[0] === undefined) return;
		const swap = pool.swaps[0].poolTotalSwapVolume;
		const volume = totalSwapVolume - swap;
		this.sumVolume += volume;
	}

	render() {
		return null;
	}
}

const mapStateToProps = (state) => {
	return {
		pools: state.balancer.pools,
		prices: state.coingecko,
		portfolioPools: state.poolReducer,
		poolsList: state.portfolio,
		moreShares: state.moreShares
	};
};

export default connect(mapStateToProps, {
	fetchPools,
	fetchPrice,
	sumLiquidity,
	clearLiquidity,
	deletePrices,
	sumAllLiq,
	deleteAllLiq,
	sumAllVol,
	deleteAllVol,
	deletePools,
	fetchPool,
	addShares,
	deleteShares,
	removePools,
	addCaps,
	removeCaps,
	sumFinal,
	deleteFinal
})(Data);
