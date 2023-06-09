import {
    VERIFICATION_BLOCK_CONFIRMATIONS,
    developmentChains,
    networkConfig,
} from "../helper-hardhat-config"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import fs from "fs"
import verify from "../utils/verify"

module.exports = async (hre: HardhatRuntimeEnvironment) => {
    const { getNamedAccounts, deployments, network, ethers } = hre
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    const currNetworkConfig = networkConfig?.[chainId!] || {}
    const {
        gasLane,
        subscriptionId: testNetSubscriptionId,
        callbackGasLimit,
        mintFee,
        ethUsdPriceFeed,
    } = currNetworkConfig
    const isDevChain = developmentChains.includes(network.name)

    let ethUsdPriceFeedAddress

    if (isDevChain) {
        const EthUsdAggregator = await ethers.getContract("MockV3Aggregator")
        ethUsdPriceFeedAddress = EthUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = ethUsdPriceFeed
    }

    const lowSvg = fs.readFileSync("./images/dynamic/frown.svg", { encoding: "utf-8" })
    const highSvg = fs.readFileSync("./images/dynamic/happy.svg", { encoding: "utf-8" })

    const args = [ethUsdPriceFeedAddress, lowSvg, highSvg]

    const dynamicSvgNft = await deploy("DynamicSvgNft", {
        from: deployer,
        log: true,
        args,
        waitConfirmations: isDevChain ? 1 : VERIFICATION_BLOCK_CONFIRMATIONS,
    })

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("verifying ...")
        await verify(dynamicSvgNft.address, args)
    }
    log("---------------------------------------------")
}

module.exports.tags = ["all", "dynamic", "main"]
