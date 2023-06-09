import { ethers, network } from "hardhat"
import { BasicNFT, RandomIpfsNft, DynamicSvgNft } from "../typechain-types/contracts"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import {
    VERIFICATION_BLOCK_CONFIRMATIONS,
    developmentChains,
    networkConfig,
} from "../helper-hardhat-config"
import { VRFCoordinatorV2Mock } from "../typechain-types"

module.exports = async function (hre: HardhatRuntimeEnvironment) {
    const { getNamedAccounts } = hre
    const { deployer } = await getNamedAccounts()

    // Basic NFT
    const basicNft: BasicNFT = await ethers.getContract("BasicNFT", deployer)
    const basicMintTx = await basicNft.mintNFT()
    await basicMintTx.wait(1)
    console.log(`Basic nft index 0 has tokenUri: ${await basicNft.tokenURI(0)}`)

    // Random ipfs NFT
    const randomIpfsNft: RandomIpfsNft = await ethers.getContract("RandomIpfsNft", deployer)
    const mintFee = await randomIpfsNft.getMintFee()

    await new Promise(async (resolve, reject) => {
        setTimeout(resolve, 100000)
        randomIpfsNft.once("NftMinted", resolve)

        const isDevChain = developmentChains.includes(network.name)
        const randomIpfsMintTx = await randomIpfsNft.requestNft({ value: mintFee.toString() })
        const RandomIpfsMintTxReceipt = await randomIpfsMintTx.wait(1)
        if (isDevChain) {
            const requestId = RandomIpfsMintTxReceipt?.events?.[0]?.args?.requestId.toString()
            const vrfCoordinatorV2Mock: VRFCoordinatorV2Mock = await ethers.getContract(
                "VRFCoordinatorV2Mock",
                deployer
            )
            await vrfCoordinatorV2Mock.fulfillRandomWords(requestId, randomIpfsNft.address)
        }
    })
    console.log(`Random IPFS nft index 0 has tokenUri: ${await randomIpfsNft.tokenURI(0)}`)

    // Dynamic svg NFT
    const highValue = ethers.utils.parseEther("4000")
    const dynamicSvgNft: DynamicSvgNft = await ethers.getContract("DynamicSvgNft", deployer)
    const dynamicSvgNftMintTx = await dynamicSvgNft.mintNft(highValue.toString())
    await dynamicSvgNftMintTx.wait(1)
    console.log(`DynamicSvgNft index 0 has tokenUri: ${await dynamicSvgNft.tokenURI(0)}`)
}
