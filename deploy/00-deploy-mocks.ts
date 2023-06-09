import { utils } from "ethers"
import { ethers, network } from "hardhat"
import { developmentChains } from "../helper-hardhat-config"
import { HardhatRuntimeEnvironment } from "hardhat/types"

const BASE_FEE = utils.parseEther("0.25") // 0.25 is the premium (base), cost 0.25 LINK per req;
// calculated value based on the gas price of the chain
// chainlink nodes pay the gas fees to give us randomness & do external execution
// the price of request based on the price of gas
const GAS_PRICE_LINK = 1e9 // link per gas

const DECIMALS = "18"

const INITIAL_PRICE = ethers.utils.parseEther("200")

module.exports = async (hre: HardhatRuntimeEnvironment) => {
    const { getNamedAccounts, deployments } = hre
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const args = [BASE_FEE, GAS_PRICE_LINK]
    const chainId = network.config.chainId

    if (developmentChains.includes(network.name)) {
        log("local network detected, Deploying mocks...")
        await deploy("VRFCoordinatorV2Mock", {
            from: deployer,
            log: true,
            args,
        })

        await deploy("MockV3Aggregator", {
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_PRICE],
        })
        log("Mocks deployed ~~~")
        log("------------------ ---------------- ----------------")
    }
}

module.exports.tags = ["all", "mocks"]
