import React, { useState, useEffect } from 'react';

import { Grid, Typography, Card, Button, Fade } from '@mui/material';

import AmpCalcInput from './AmpCalcInput';
import AmpCalcAutoFill from './AmpCalcAutoFill';
import Footer from './Footer';
import WarningDialogPopover from './WarningDialogPopover';

const initialState = {
    totalAmp: '',
    apy: '',
}

const AmpCalculator = () => {
    const [formData, setFormData] = useState(initialState);
    const [gwei, setGwei] = useState('');
    const [ethInUSD, setEthInUSD] = useState('');
    const [currentAmpPrice, setCurrentAmpPrice] = useState('');
    const [fadeIn, setFadeIn] = useState(false);
    const [showDialog, setShowDialog] = useState(false);
    const [warning, setWarning] = useState('');


    useEffect(() => {
        fetch(`http://localhost:4000/ampStake/getGasFees`)
        .then(res => res.json())
        .then(data => setGwei(data.gwei))
        .catch(error => console.log(error))

        fetch('http://localhost:4000/ampStake/getEthPrice')
        .then(res => res.json())
        .then(data => setEthInUSD(data.eth))
        .catch(error => console.log(error))

        fetch('http://localhost:4000/ampStake/getAmpPrice')
        .then(res => res.json())
        .then(data => setCurrentAmpPrice(data.ampPrice))
        .catch(error => console.log(error))
    }, [])

    const handleChange = ({target}) => {
        setFormData({...formData, [target.name]: target.value})

    }   

    const timeToRecoup = (days) => {
        // console.log(days + ' days');
        if(days > 30 && days < 365) {
            const months = days / 30;

            const daysFraction = months % 1;
            const remainingDays = Math.floor(daysFraction * 30);

            const formattedTime = `${Math.floor(months)} month(s) ${remainingDays > 0 ? `and ${remainingDays} day(s)` : ''}`
            
            return formattedTime;

        } else if(days > 365) {
            const years = days / 365;

            const monthsFraction = years % 1;
            // console.log(monthsFraction + ' monthsFraction')
            const remainingMonths = monthsFraction * 365 / 30;
            // console.log(remainingMonths + ' Remaining Months');
            const daysFraction = remainingMonths % 1;
            // console.log(daysFraction + ' DaysFraction');
            const remainingDays = Math.floor(daysFraction * 30);
            // console.log(remainingDays + ' remaining days');

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
        const decimalAPY = parseFloat(formData.apy) / 100;

        const costToStakeInUSD = 0.000000001 * 191000 * parseInt(gwei) * parseInt(ethInUSD);

        const costToStakeInAmp = costToStakeInUSD / currentAmpPrice;

        const compondedInterestPerYear = (parseInt(formData.totalAmp) * (1 + (decimalAPY / 35040)) ** 35040) - parseInt(formData.totalAmp);

        const compondedInterestPerDay = compondedInterestPerYear / 365;

        const daysToMakeUpCost = costToStakeInAmp / compondedInterestPerDay;

        const timeToRecoupCost = timeToRecoup(Math.round(daysToMakeUpCost));
    

        return timeToRecoupCost;
    }

    const handleButton = () => {
        if(formData.totalAmp.length === 0 || formData.apy.length === 0) {
            setWarning(`Both "Amp Amount" and "Current APY" are required fields`);
            setShowDialog(true);
        } else if (isNaN(parseInt(formData.totalAmp)) || isNaN(parseInt(formData.apy))) {
            setWarning(`Please only type in numbers`);
            setShowDialog(true);
        } else {
            setFadeIn(true);
        }
    }

    const closeDialog = () => {
        setShowDialog(false);
    }

    const result = (
        <Grid container justifyContent='center'>
            <Card elevation={10} style={{padding: '10px', maxWidth: '800px'}}>
                <Typography align='center' gutterBottom>
                    {`If you were to stake ${formData.totalAmp} AMP right now it will take ${howLong()} to recoup the cost of staking from rewarded AMP.`}
                </Typography>
                <Typography align='center' gutterBottom>
                    {`Note: This is based on the current AMP price of $${currentAmpPrice}. Hopefully, Amp will continue to grow in value and you'll make up the cost more quickly!`}
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
                            <Typography style={{margin: '10px', align: 'center'}}>Use this simple calculator to help determine if it's a good time to stake your AMP</Typography>
                            <AmpCalcInput name='totalAmp' id='totalAmp' label='Amp Amount (ex. 10000)' autoFocus type='text' handleChange={handleChange} />
                            <AmpCalcInput name='apy' id='apy' label='Current APY (ex. 4.19 %)' type='text' handleChange={handleChange} />
                            <AmpCalcAutoFill name='ampPrice' id='ampPrice' label='Current AMP Price' type='text' value={currentAmpPrice} dollarSign handleChange={handleChange} />
                            <AmpCalcAutoFill name='gwei' id='gwei' label='Current Gas fee' type='text' value={gwei} handleChange={handleChange} />
                            <AmpCalcAutoFill name='ethInUSD' id='ethInUSD' label='Current Eth price (USD)' value={ethInUSD} dollarSign type='text' handleChange={handleChange} />
                            <Button variant='contained' onClick={handleButton} style={{marginTop: '15px'}}>Show Me</Button>
                            <Typography style={{paddingTop: '10px'}}>AMP price data provided by {<a href='https://www.coingecko.com/en'>CoinGecko</a>}</Typography>
                        </Grid>
                        </Card>
                    </Grid>
                    <Grid item>
                        <img src='ampLogo.png' alt='ampLogo' />
                    </Grid>
                </Grid>
            </div>
            <div style={{marginTop: '100px'}}>
                <Fade in={fadeIn}>{result}</Fade>
            </div>
            <div>
                <Footer />
            </div>
            <WarningDialogPopover open={showDialog} onClose={closeDialog} warning={warning} />
        </div>
    )
}

export default AmpCalculator;