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
import React, { useState } from 'react';
import Button from '../button';
import { FiDownload } from 'react-icons/fi';
import Copy from '../copy';
import CustomTabs from '../Tabs';
import { githubUrls } from '../../const/globalConst';

const CloneModal = ({ type }) => {
    const [tabValue, setTabValue] = useState('HTTPS');
    const downloadRepoArchive = async () => {
        window.open(githubUrls[type].DOWNLOAD_URL, '_blank');
    };

    return (
        <div className="clone-wrapper">
            <p className="title"> Clone</p>
            <p className="subtitle">Kindly clone our explanatory repository to quickly start.</p>
            <CustomTabs tabs={['HTTPS', 'SSH']} size={'small'} tabValue={tabValue} onChange={(tabValue) => setTabValue(tabValue)} />
            {tabValue === 'HTTPS' ? (
                <>
                    <div className="url-wrapper">
                        <p className="url-text"> {githubUrls[type].MEMPHIS_GIT_HTTPS}</p>
                        <div className="icon">
                            <Copy width="18" data={githubUrls[type].MEMPHIS_GIT_HTTPS} />
                        </div>
                    </div>
                </>
            ) : (
                <>
                    <div className="url-wrapper">
                        <p className="url-text"> {githubUrls[type].MEMPHIS_GIT_SSH}</p>
                        <div className="icon">
                            <Copy width="18" data={githubUrls[type].MEMPHIS_GIT_SSH} />
                        </div>
                    </div>
                </>
            )}
            <p className="secondary-text">Use Git or checkout with SVN using the web URL.</p>

            <div className="footer">
                <Button
                    placeholder={
                        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                            <FiDownload width={16} height={14} /> Download ZIP
                        </div>
                    }
                    colorType={'purple'}
                    onClick={downloadRepoArchive}
                    fontSize={'14px'}
                    fontWeight={500}
                    border="none"
                    backgroundColorType={'none'}
                />
            </div>
        </div>
    );
};

export default CloneModal;
