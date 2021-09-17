import React from 'react';

import { Typography } from '@mui/material';


const Footer = () => {
    return(
        <div style={{position: 'fixed', width: '100%', height: '200px', top: '95%', backgroundColor: '#4B3F72'}}>
            <Typography align='center' variant='body2' style={{paddingTop: '10px', fontWeight: 'bold', color: 'white'}}>
                The contents on this site are for informational purposes only and does not constitute financial, accounting, or investment advice.
            </Typography>
        </div>
    )
}

export default Footer;
