import React from 'react'
import { Button, Result } from 'antd';
import 'antd/dist/antd.css';
import { useNavigate } from 'react-router-dom';

export default function DynamicSignResult() {

    let navigate = useNavigate();
    const routeDashboard = () => {
        let path = `/dashboard-animals`;
        navigate(path);
    }
    return (
        <Result
            status="success"
            title="Successfully Practised!"
            subTitle="You have successfully practised the sign language."
            extra={[
                <Button type="primary" key="console" onClick={routeDashboard}>
                    Go Console
                </Button>,
            ]}
        />
    )
}
