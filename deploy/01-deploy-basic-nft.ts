import {
    VERIFICATION_BLOCK_CONFIRMATIONS,
    developmentChains,
    networkConfig,
} from "../helper-hardhat-config"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import verify from "../utils/verify"

module.exports = async (hre: HardhatRuntimeEnvironment) => {
    const { getNamedAccounts, deployments, network, ethers } = hre
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    const basicNFT = await deploy("BasicNFT", {
        from: deployer,
        args: [],
        log: true,
        waitConfirmations: 1,
    })
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("verifying ...")
        await verify(basicNFT.address, [])
    }
}

module.exports.tags = ["all", "basic", "main"]
