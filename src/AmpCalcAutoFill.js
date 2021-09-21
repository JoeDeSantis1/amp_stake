import React, { useState } from 'react';

import { Grid, TextField, InputAdornment, IconButton } from '@mui/material';

import EditOutlinedIcon from '@mui/icons-material/EditOutlined';

const AmpCalcAutoFill = ({name, id, handleChange, label, value, autoFocus, dollarSign, type }) => {
    const [unlockField, setUnlockField] = useState(false);

    const handleUnlockField = () => {
        setUnlockField(true)
    }

    return(
        <Grid item style={{width: '300px'}}>
            {unlockField ?
                <TextField 
                    name={name}
                    id={id}
                    onChange={handleChange}
                    variant='outlined'
                    fullWidth
                    label={label}
                    autoFocus={autoFocus}
                    type={type}
                    required
                />
            :
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
                            endAdornment: <InputAdornment position='end'>
                                <IconButton onClick={handleUnlockField}>
                                    <EditOutlinedIcon />
                                </IconButton>
                            </InputAdornment>
                        }
                        :
                        {
                            readOnly: true,
                            endAdornment: <InputAdornment position='end'>
                                <IconButton onClick={handleUnlockField}>
                                    <EditOutlinedIcon/>
                                </IconButton>
                            </InputAdornment>
                        }
                    }
                />
                }
        </Grid>
    )
}

export default AmpCalcAutoFill