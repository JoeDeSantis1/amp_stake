import React, { useState, useEffect } from 'react';

import { Grid, Typography, Card, Button, Fade } from '@mui/material';

import AmpCalcInput from './AmpCalcInput';
import AmpCalcAutoFill from './AmpCalcAutoFill';
import Footer from './Footer';
import WarningDialogPopover from './WarningDialogPopover';
import Loading from './Loading';

const initialState = {
    totalAmp: '',
    apy: '',
    gwei: '',
    ethInUSD: '',
    currentAmpPrice: '' 
}

const AmpCalculator = () => {
    const [formData, setFormData] = useState(initialState);
    const [gwei, setGwei] = useState('');
    const [ethInUSD, setEthInUSD] = useState('');
    const [currentAmpPrice, setCurrentAmpPrice] = useState('');
    const [fadeIn, setFadeIn] = useState(false);
    const [gasLoaded, setGasLoaded] = useState(false);
    const [ethLoaded, setEthLoaded] = useState(false);
    const [ampLoaded, setAmpLoaded] = useState(false);
    const [showDialog, setShowDialog] = useState(false);
    const [showResult, setShowResult] = useState(true);
    const [warning, setWarning] = useState('');


    useEffect(() => {
        const fetchingData = async () => {
            try {
                fetch(`https://young-refuge-35360.herokuapp.com/ampStake/getGasFees`)
                .then(res => res.json())
                .then(data => {
                    setGwei(data.gwei)
                    setGasLoaded(true);
                })
                .catch(error => console.log(error))

                fetch('https://young-refuge-35360.herokuapp.com/ampStake/getEthPrice')
                .then(res => res.json())
                .then(data => {
                    setEthInUSD(data.eth)
                    setEthLoaded(true);
                })
                .catch(error => console.log(error))

                fetch('https://young-refuge-35360.herokuapp.com/ampStake/getAmpPrice')
                .then(res => res.json())
                .then(data => {
                    setCurrentAmpPrice(data.ampPrice)
                    setAmpLoaded(true);
                })
                .catch(error => console.log(error))

            } catch(error) {
                console.log(error)
            }
        }

        fetchingData();
    }, [])

    const handleChange = ({target}) => {
        if(target.value === '') {
            setShowResult(false);
        }

        setFormData({...formData, [target.name]: target.value})

        if(target.name === 'gwei') {
            setGwei(target.value);
        } else if (target.name === 'ethInUSD') {
            setEthInUSD(target.value);
        } else if (target.name === 'currentAmpPrice') {
            setCurrentAmpPrice(target.value);
        };

    }   

    const timeToRecoup = (days) => {
        if(days > 30 && days < 365) {
            const months = days / 30;

            const daysFraction = months % 1;
            const remainingDays = Math.floor(daysFraction * 30);

            const formattedTime = `${Math.floor(months)} month(s) ${remainingDays > 0 ? `and ${remainingDays} day(s)` : ''}`
            
            return formattedTime;

        } else if(days > 365) {
            const years = days / 365;

            const monthsFraction = years % 1;
            const remainingMonths = monthsFraction * 365 / 30;
            const daysFraction = remainingMonths % 1;
            const remainingDays = Math.floor(daysFraction * 30);

            if(Math.floor(remainingMonths) === 0) {
                const formattedTime = `${Math.floor(years)} year(s) ${remainingDays > 0 ? `and ${remainingDays} day(s)` : ''}`
                return formattedTime;
            } else {
                const formattedTime = `${Math.floor(years)} year(s), ${Math.floor(remainingMonths)} month(s)${remainingDays > 0 ? `, and ${remainingDays} day(s)` : ``}`
                return formattedTime;
            }

        } else {
            return `${days} days`;
        }
    }

    const howLong = () => {
        let apy = formData.apy;
        let totalAmp = formData.totalAmp;
        let decimalAPY;

        if(totalAmp.includes(',')) {
            totalAmp = totalAmp.replaceAll(',', ''); 
        }

        if(apy.includes('%')) {
            apy = apy.replace('%', '');
            decimalAPY = parseFloat(apy) / 100;
        } else if (apy.startsWith('0') || apy.startsWith('.')) {
            decimalAPY = apy;
        } else {
            decimalAPY = parseFloat(apy) / 100;
        }

        const costToStakeInUSD = 0.000000001 * 191000 * parseInt(gwei) * parseInt(ethInUSD);

        const costToStakeInAmp = costToStakeInUSD / currentAmpPrice;

        const compondedInterestPerYear = (parseInt(totalAmp) * (1 + (decimalAPY / 35040)) ** 35040) - parseInt(totalAmp);

        const compondedInterestPerDay = compondedInterestPerYear / 365;

        const daysToMakeUpCost = costToStakeInAmp / compondedInterestPerDay;

        const timeToRecoupCost = timeToRecoup(Math.round(daysToMakeUpCost));
    

        return timeToRecoupCost;
    }

    const handleButton = () => {
        if(formData.totalAmp.length === 0 || formData.apy.length === 0) {
            setWarning(`All fields are required`);
            setShowDialog(true);
        } else if (function() {
            for (const [key, value] of Object.entries(formData)) {
                if (formData[key] === '') {
                    return true
                }

                return false;
            }
        }) {
            setWarning(`Please only type in numbers`);
            setShowDialog(true);
        } else {
            setShowResult(true);
            setFadeIn(true);
        }

        //isNaN(parseInt(formData.totalAmp)) || isNaN(parseInt(formData.apy))
    }

    const closeDialog = () => {
        setShowResult(true);
        setShowDialog(false);
    }

    const result = (
        <Grid container justifyContent='center'>
            <Card elevation={10} style={{padding: '10px', maxWidth: '800px'}}>
                <Typography align='center' gutterBottom>
                    {`If you were to stake ${formData.totalAmp} AMP right now, it will take about ${howLong()} for your rewards to recoup the cost of staking`}
                </Typography>
                <Typography align='center' gutterBottom>
                    {`Note: This is based on the current AMP price of $${currentAmpPrice}. The price per AMP is always changing which will affect how quickly the fees are recouped`}
                </Typography>
            </Card>
        </Grid>
    );

    const notANumber = (
        <Grid container justifyContent='center'>
            <Card elevation={10} style={{padding: '10px', maxWidth: '800px'}}>
                <Typography align='center' gutterBottom>
                    Check your entered values, something's not right
                </Typography>
            </Card>
        </Grid>
    );

    return(
        <div>
            <div>
                <Grid container spacing={25} justifyContent='center' style={{flexWrap: 'nowrap', paddingTop: '50px'}}>
                    <Grid item>
                        <img src='ampLogo.png' alt='ampLogo' />
                    </Grid>
                    <Grid item>
                        <Card elevation={10}>
                        <Grid container spacing={2} direction='column' alignItems='center' raised style={{padding: '16px', minWidth: '250px', maxWidth: '645px', marginLeft: '0px', marginTop: '0px', width: '100%' }}>
                            <Typography align='center' style={{margin: '10px'}}>Use this simple calculator to help determine how long it will take to recoup the cost of staking your AMP</Typography>
                            <AmpCalcInput name='totalAmp' id='totalAmp' label='Amp Amount' autoFocus type='text' handleChange={handleChange} />
                            <AmpCalcInput name='apy' id='apy' label='Current APY (ex. 4.19, 4.19%, or 0.0419)' type='text' handleChange={handleChange} />
                            { ampLoaded ?
                                <AmpCalcAutoFill name='currentAmpPrice' id='currentAmpPrice' label='Current AMP Price' type='text' value={currentAmpPrice} dollarSign handleChange={handleChange} />
                                :
                                <Loading />
                            }
                            { gasLoaded ?
                                <AmpCalcAutoFill name='gwei' id='gwei' label='Current Gas fee' type='text' value={gwei} handleChange={handleChange} />
                                :
                                <Loading />
                            }
                            { ethLoaded ?
                                <AmpCalcAutoFill name='ethInUSD' id='ethInUSD' label='Current Eth price (USD)' value={ethInUSD} dollarSign type='text' handleChange={handleChange} />
                                :
                                <Loading />
                            }
                            <Button variant='contained' onClick={handleButton} style={{marginTop: '15px'}}>Calculate How Long</Button>
                            <Typography style={{paddingTop: '10px'}}>AMP price data provided by {<a href='https://www.coingecko.com/en'>CoinGecko</a>}</Typography>
                        </Grid>
                        </Card>
                    </Grid>
                    <Grid item>
                        <img src='ampLogo.png' alt='ampLogo' />
                    </Grid>
                </Grid>
            </div>
            { showResult ? 
            <div style={{marginTop: '40px'}}>
                <Fade in={fadeIn}>{result}</Fade>
            </div>
            :
            <div style={{marginTop: '40px'}}>
                <Fade in={fadeIn}>{notANumber}</Fade>
            </div>
            }
            <div>
                <Footer />
            </div>
            <WarningDialogPopover open={showDialog} onClose={closeDialog} warning={warning} />
        </div>
    )
}

export default AmpCalculator;