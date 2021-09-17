import React from 'react';

import { Grid, TextField, InputAdornment } from '@mui/material';

const AmpCalcAutoFill = ({name, id, handleChange, label, value, autoFocus, dollarSign, type}) => {
    return(
        <Grid item style={{width: '300px'}}>
            <TextField 
                name={name}
                id={id}
                onChange={handleChange}
                variant='filled'
                fullWidth
                value={dollarSign ? value : `${value} gwei`}
                label={label}
                autoFocus={autoFocus}
                type={type}
                InputLabelProps={{
                    shrink: true,
                }}
                InputProps={
                    dollarSign ? {
                        readOnly: true,
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }
                    :
                    {
                        readOnly: true,
                    }
                }
            />
        </Grid>
    )
}

export default AmpCalcAutoFill