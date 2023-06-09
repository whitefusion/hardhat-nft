import pinataSDK from "@pinata/sdk"
import path from "path"
import fs from "fs"
import "dotenv/config"

const { PINATA_API_KEY, PINATA_API_SECRET } = process.env
const pinata = new pinataSDK(PINATA_API_KEY, PINATA_API_SECRET)

export async function storeImages(imagesFilePath: string) {
    const fullImagesPath = path.resolve(imagesFilePath)
    const files = fs.readdirSync(fullImagesPath)
    let responses = []
    console.log("Uploading to IPFS ~~~", files)
    for (let fileIndex in files) {
        const readableStreamForFile = fs.createReadStream(`${fullImagesPath}/${files[fileIndex]}`)
        try {
            const response = await pinata.pinFileToIPFS(readableStreamForFile, {
                pinataMetadata: { name: files[fileIndex] },
            })
            responses.push(response)
        } catch (e) {
            console.log(e)
        }
    }
    return { responses, files }
}

export async function storeTokenUriMetadata(metadata: any) {
    try {
        const response = await pinata.pinJSONToIPFS(metadata, {
            pinataMetadata: { name: metadata.name + "_metadata" },
        })
        return response
    } catch (e) {
        console.log(e)
    }
}
