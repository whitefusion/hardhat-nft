import {
    VERIFICATION_BLOCK_CONFIRMATIONS,
    developmentChains,
    networkConfig,
} from "../helper-hardhat-config"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import verify from "../utils/verify"
import { storeImages, storeTokenUriMetadata } from "../utils/uploadToPinata"

const imagesLocation = "./images/random/"
const metadataTemplate = {
    name: "",
    description: "",
    image: "",
    attributes: [],
}

let tokenUris = [
    "ipfs://QmPHPmMc7mraYGkmk13zLqzkcJTn5QMH4K6J54oyHUzVky",
    "ipfs://Qmb5tjsnBbHjE65zoMypYvQucm1j131E9b3T9VoqgtCWKA",
    "ipfs://QmULn8CU3QegftZZ6GBTrqSEckaA2eLX1HqAi1sPh5FNEu",
]

module.exports = async (hre: HardhatRuntimeEnvironment) => {
    const { getNamedAccounts, deployments, network, ethers } = hre
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    // get ipfs hashes of images
    if (process.env.UPLOAD_TO_PINATA === "true") {
        tokenUris = await handleTokenUris()
    }

    const currNetworkConfig = networkConfig?.[chainId!] || {}
    const {
        vrfCoordinatorV2: testNetVrfCoordinatorV2,
        gasLane,
        subscriptionId: testNetSubscriptionId,
        callbackGasLimit,
        mintFee,
    } = currNetworkConfig
    const VRF_SUB_FUND_AMOUNT = ethers.utils.parseEther("2")
    const isDevChain = developmentChains.includes(network.name)

    let vrfCoordinatorV2Address, subscriptionId
    if (isDevChain) {
        const vrfCooridinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
        vrfCoordinatorV2Address = vrfCooridinatorV2Mock.address
        const txResponse = await vrfCooridinatorV2Mock.createSubscription()
        const txReceipt = await txResponse.wait(1)
        subscriptionId = txReceipt.events[0].args.subId
        await vrfCooridinatorV2Mock.fundSubscription(subscriptionId, VRF_SUB_FUND_AMOUNT)
    } else {
        vrfCoordinatorV2Address = testNetVrfCoordinatorV2
        subscriptionId = testNetSubscriptionId
    }

    const args = [
        vrfCoordinatorV2Address,
        gasLane,
        subscriptionId,
        callbackGasLimit,
        tokenUris,
        mintFee,
    ]
    const randomIpfsNft = await deploy("RandomIpfsNft", {
        from: deployer,
        args,
        log: true,
        waitConfirmations: isDevChain ? 1 : VERIFICATION_BLOCK_CONFIRMATIONS,
    })

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("verifying ...")
        await verify(randomIpfsNft.address, args)
    }
    log("---------------------------------------------")
}

async function handleTokenUris() {
    const { responses, files } = await storeImages(imagesLocation)
    const tokenUris = []
    for (let i in files) {
        const tempUri = {
            ...metadataTemplate,
            name: files[i].replace(".png", ""),
            image: `ipfs://${responses?.[i]?.IpfsHash}`,
        }
        console.log(`Uploading ${tempUri.name} oooooooooo`)
        const metadataUploadResponse = await storeTokenUriMetadata(tempUri)
        tokenUris.push(`ipfs://${metadataUploadResponse?.IpfsHash}`)
    }
    console.log("tokenuris: ", tokenUris)
    return tokenUris
}

module.exports.tags = ["all", "randomipfs", "main"]
