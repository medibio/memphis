// Copyright 2022-2023 The Memphis.dev Authors
// Licensed under the Memphis Business Source License 1.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// Changed License: [Apache License, Version 2.0 (https://www.apache.org/licenses/LICENSE-2.0), as published by the Apache Foundation.
//
// https://github.com/memphisdev/memphis/blob/master/LICENSE
//
// Additional Use Grant: You may make use of the Licensed Work (i) only as part of your own product or service, provided it is not a message broker or a message queue product or service; and (ii) provided that you do not use, provide, distribute, or make available the Licensed Work as a Service.
// A "Service" is a commercial offering, product, hosted, or managed service, that allows third parties (other than your own employees and contractors acting on your behalf) to access and/or use the Licensed Work or a substantial set of the features or functionality of the Licensed Work to third parties as a software-as-a-service, platform-as-a-service, infrastructure-as-a-service or other similar services that compete with Licensor products or services.

import './style.scss';

import { useState, useEffect } from 'react';
import { ReactComponent as TestEventModalIcon } from '../../../../../../assets/images/testEventModalcon.svg';
import Button from '../../../../../../components/button';
import Editor from '@monaco-editor/react';
import TestResult from '../testResult';
import { httpRequest } from '../../../../../../services/http';
import { ApiEndpoints } from '../../../../../../const/apiEndpoints';

const TestMockEvent = ({ functionDetails, open }) => {
    const [testMock, setTestMock] = useState(`{
        "type": "record",
        "namespace": "com.example",
        "name": "test-schema",
        "fields": [
           { "name": "Master message", "type": "string", "default": "NONE" },
           { "name": "age", "type": "int", "default": "-1" },
           { "name": "phone", "type": "string", "default": "NONE" },
           { "name": "country", "type": "string", "default": "NONE" }
            ]
        }`);
    const [testResultData, setTestResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    useEffect(() => {
        setTestResult(null);
    }, [open]);

    const testEvent = async () => {
        setIsLoading(true);
        const body = {
            function_name: functionDetails?.function_name,
            function_version: functionDetails?.installed_version,
            scm_type: functionDetails?.scm,
            branch: functionDetails?.branch,
            repo: functionDetails?.repo,
            owner: functionDetails?.owner,
            test_event: {
                headers: {},
                content: testMock
            }
        };
        try {
            const res = await httpRequest('POST', ApiEndpoints.TEST_FUNCTION, body);
            setTestResult(res);
        } catch (e) {
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="test-modal">
            <div className="titleIcon">
                <TestEventModalIcon />
            </div>
            <div className="header">
                <div className="title-container">
                    <p className="title">Generate test event</p>
                </div>
                <Button
                    width="120px"
                    height="40px"
                    placeholder={'Test'}
                    colorType="white"
                    radiusType="circle"
                    backgroundColorType={'purple'}
                    border={'gray'}
                    fontSize="12px"
                    fontWeight="bold"
                    onClick={() => {
                        setTestResult(null);
                        testEvent();
                    }}
                    isLoading={isLoading}
                />
            </div>
            <div className="test-area">
                <div className="text-area-wrapper">
                    <label className="title">Event data</label>
                    <div className="text-area">
                        <Editor
                            options={{
                                minimap: { enabled: false },
                                scrollbar: { verticalScrollbarSize: 0, horizontalScrollbarSize: 0 },
                                scrollBeyondLastLine: false,
                                roundedSelection: false,
                                formatOnPaste: true,
                                formatOnType: true,
                                readOnly: false,
                                fontSize: '12px',
                                fontFamily: 'Inter',
                                lineNumbers: 'off',
                                automaticLayout: true
                            }}
                            language={'json'}
                            height="calc(100%)"
                            defaultValue={testMock}
                            value={testMock}
                            key={'tested'}
                            onChange={(value) => setTestMock(value)}
                        />
                    </div>
                </div>
                <TestResult testResultData={testResultData} loading={isLoading} />
            </div>
        </div>
    );
};

export default TestMockEvent;
