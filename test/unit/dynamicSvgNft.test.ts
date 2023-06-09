import { BasicNFT } from "./../../typechain-types/contracts/BasicNFT"
import { expect, assert } from "chai"
import { deployments, ethers, getNamedAccounts, network } from "hardhat"
import { developmentChains, networkConfig } from "../../helper-hardhat-config"

const isDevChain = developmentChains.includes(network.name)

!isDevChain ? describe.skip : describe("DynamicSvgNFT", async function () {})
