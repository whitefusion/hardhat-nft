// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "base64-sol/base64.sol";

error DynamicSvgNft__RangeOutOfBounds();
error DynamicSvgNft__NeedMoreETHSent();
error DynamicSvgNft__TransferFailed();

contract DynamicSvgNft is ERC721URIStorage, Ownable {
    // mint
    // store svg somewhere
    // some logic to say show x or y image

    uint256 private s_tokenCounter;

    string private i_lowImageURI;
    string private i_highImageURI;
    string private constant base64EncocedSvgPrefix = "data:image/svg+xml;base64,";

    AggregatorV3Interface internal immutable i_priceFeed;

    mapping(uint256 => int256) public s_tokenIdToHighValue;

    event CreatedNFT(uint256 tokenId, int256 highValue);

    constructor(
        address priceFeedAddress,
        string memory lowSvg,
        string memory highSvg
    ) ERC721("Dynamic Svg Nft", "DSN") {
        s_tokenCounter = 0;
        i_lowImageURI = svgToImageURI(lowSvg);
        i_highImageURI = svgToImageURI(highSvg);
        i_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    function svgToImageURI(string memory svg) public pure returns (string memory) {
        string memory svgBase64Encoded = Base64.encode(bytes(string(abi.encodePacked(svg))));
        return string(abi.encodePacked(base64EncocedSvgPrefix, svgBase64Encoded));
    }

    function mintNft(int256 highValue) public {
        s_tokenIdToHighValue[s_tokenCounter] = highValue;
        _safeMint(msg.sender, s_tokenCounter);
        s_tokenCounter += 1;
        emit CreatedNFT(s_tokenCounter, highValue);
    }

    function _baseURI() internal pure override returns (string memory) {
        return "data:application/json;base64,";
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "URI query for non-exist token");
        // string memory imageURI = "hi";
        (, int256 price, , , ) = i_priceFeed.latestRoundData();
        string memory imageURI = i_lowImageURI;

        if (price >= s_tokenIdToHighValue[tokenId]) {
            imageURI = i_highImageURI;
        }

        bytes memory base64EncodeJson = abi.encodePacked(
            _baseURI(),
            Base64.encode(
                bytes(
                    abi.encodePacked(
                        '{"name": ',
                        name(),
                        '", "description": "An NFT that changes based on the ChainLink Feeds",',
                        '"attributes": [{"trait_type": "coolness", "value": 100}], "image": "',
                        imageURI,
                        '"}'
                    )
                )
            )
        );

        return string(base64EncodeJson);
    }
}
