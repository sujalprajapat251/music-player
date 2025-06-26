import { useSnackbar } from 'notistack';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { resetAlert } from '../Redux/Slice/alert.slice';

function Alert(props) {
    const alert = useSelector(state => state.alert);
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    const dispatch = useDispatch();

    // console.log(alert);

    useEffect(() => {
        if (alert.text !== '') {
            enqueueSnackbar(alert.text, {
                variant: alert.color,
                anchorOrigin: {
                    vertical: 'bottom',
                    horizontal: 'right'
                },
                autoHideDuration: 1500
            });

            const timer = setTimeout(() => {
                dispatch(resetAlert())
            }, 2000);

            return () => {
                clearTimeout(timer);
            }
        }
    }, [alert.text])

    return (
        <>
        </>
    )
}

export default Alert;