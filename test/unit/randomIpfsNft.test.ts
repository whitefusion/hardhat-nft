import { RandomIpfsNft } from "./../../typechain-types/contracts/RandomIpfsNft"
import { expect, assert } from "chai"
import { deployments, ethers, getNamedAccounts, network } from "hardhat"
import { developmentChains, networkConfig } from "../../helper-hardhat-config"

const isDevChain = developmentChains.includes(network.name)

!isDevChain ? describe.skip : describe("RandomIpfsNft", async function () {})
