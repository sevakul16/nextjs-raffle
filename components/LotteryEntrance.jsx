import { ethers } from "ethers"
import React, { useEffect, useState } from "react"
import { useMoralis, useWeb3Contract } from "react-moralis"
import { useNotification } from "web3uikit"
import { abi, contractAddresses } from "../constants"

const LotteryEntrance = () => {
    const { chainId: chainIdHex, isWeb3Enabled, web3 } = useMoralis()
    const chainId = parseInt(chainIdHex)
    const raffleAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null
    const [entranceFee, setEntranceFee] = useState("0")
    const [numPlayers, setNumPlayers] = useState("0")
    const [recentWinner, setRecentWinner] = useState("0")
    const [provider, setProvider] = useState()

    const dispatch = useNotification()

    const { runContractFunction: enterRaffle } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "enterRaffle",
        params: {},
        msgValue: entranceFee,
    })

    const { runContractFunction: getEntranceFee } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getEntranceFee",
        params: {},
    })

    const { runContractFunction: getNumberOfPlayers } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getNumberOfPlayers",
        params: {},
    })

    const { runContractFunction: getRecentWinner } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getRecentWinner",
        params: {},
    })

    async function updateUI() {
        setEntranceFee((await getEntranceFee()).toString())
        setNumPlayers((await getNumberOfPlayers()).toString())
        setRecentWinner(await getRecentWinner())
    }

    useEffect(() => {
        console.log(chainId)
        if (isWeb3Enabled) {
            updateUI()
            // listenForWinnerToBePicked()
        }
    }, [isWeb3Enabled])

    // async function listenForWinnerToBePicked() {
    //     const lottery = new ethers.Contract(raffleAddress, abi, web3)
    //     console.log("Waiting for a winner ...")
    //     await new Promise((resolve, reject) => {
    //         lottery.once("WinnerPicked", async () => {
    //             console.log("We got a winner!")
    //             try {
    //                 await updateUI()
    //                 resolve()
    //             } catch (error) {
    //                 console.log(error)
    //                 reject(error)
    //             }
    //         })
    //     })
    // }

    const handleSuccess = async function (tx) {
        await tx.wait(1)
        handleNotification()
        updateUI()
    }

    const handleNotification = function () {
        dispatch({
            type: "info",
            message: "Transaction Complete",
            title: "Tx Notification",
            position: "topR",
            icon: "bell",
        })
    }

    return (
        <div>
            <p>Hi from lottery entrance</p>
            {raffleAddress ? (
                <div>
                    <button
                        onClick={async () => {
                            await enterRaffle({
                                onSuccess: handleSuccess,
                                onError: (error) => console.log(error),
                            })
                        }}
                    >
                        Enter Raffle
                    </button>
                    <p>Entrance fee: {ethers.utils.formatUnits(entranceFee, "ether")} ETH</p>
                    <p>Number of players: {numPlayers}</p>
                    <p>Recent Winner: {recentWinner}</p>
                </div>
            ) : (
                <p>No raffleAddress Detected</p>
            )}
        </div>
    )
}

export default LotteryEntrance
