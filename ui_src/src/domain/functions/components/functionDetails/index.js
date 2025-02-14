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
import React, { useEffect, useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import emoji from 'emoji-dictionary';
import Editor from '@monaco-editor/react';
import { FiGitCommit } from 'react-icons/fi';
import { BiDownload } from 'react-icons/bi';
import { MdOutlineFileDownloadOff } from 'react-icons/md';
import { GoFileDirectoryFill } from 'react-icons/go';
import { Divider, Rate } from 'antd';
import { ReactComponent as CollapseArrowIcon } from '../../../../assets/images/collapseArrow.svg';
import Button from '../../../../components/button';
import TagsList from '../../../../components/tagList';
import Spinner from '../../../../components/spinner';

import { parsingDate } from '../../../../services/valueConvertor';
import { ReactComponent as MemphisFunctionIcon } from '../../../../assets/images/memphisFunctionIcon.svg';
import { ReactComponent as FunctionIcon } from '../../../../assets/images/functionIcon.svg';
import { ReactComponent as CodeBlackIcon } from '../../../../assets/images/codeIconBlack.svg';
import { ReactComponent as GithubBranchIcon } from '../../../../assets/images/githubBranchIcon.svg';
import { ReactComponent as PlaceholderFunctionsIcon } from '../../../../assets/images/placeholderFunctions.svg';
import { ReactComponent as ArrowBackIcon } from '../../../../assets/images/arrowBackIcon.svg';
import CustomTabs from '../../../../components/Tabs';
import SelectComponent from '../../../../components/select';
import TestMockEvent from '../testFunctionModal/components/testMockEvent';
import Modal from '../../../../components/modal';
import { OWNER } from '../../../../const/globalConst';
import { BsFileEarmarkCode } from 'react-icons/bs';
import { GoRepo } from 'react-icons/go';
import { Tree } from 'antd';
import { httpRequest } from '../../../../services/http';
import { ApiEndpoints } from '../../../../const/apiEndpoints';

function FunctionDetails({ selectedFunction, installed, handleInstall, handleUnInstall, clickApply, onBackToFunction = null }) {
    const [tabValue, setTabValue] = useState('Details');
    const [isTestFunctionModalOpen, setIsTestFunctionModalOpen] = useState(false);
    const [treeData, setTreeData] = useState([]);
    const [selectedVersion, setSelectedVersion] = useState('latest');
    const [metaData, setMetaData] = useState({});
    const [readme, setReadme] = useState('');
    const [versions, setVersions] = useState([]);
    const [files, setFiles] = useState([]);
    const [fileContent, setFileContent] = useState(null);

    const [isFileContentLoading, setIsFileContentLoading] = useState(false);

    const emojiSupport = (text) => text.replace(/:\w+:/gi, (name) => emoji.getUnicode(name));

    useEffect(() => {
        getFunctionDetails();
    }, [selectedFunction]);

    useEffect(() => {
        buildTree(files);
    }, [files]);

    const getFunctionDetails = async () => {
        try {
            const response = await httpRequest(
                'GET',
                ApiEndpoints.GET_FUNCTION_DETAIL +
                    '?repo=' +
                    encodeURI(selectedFunction?.repo) +
                    '&branch=' +
                    encodeURI(selectedFunction?.branch) +
                    '&owner=' +
                    encodeURI(selectedFunction?.owner) +
                    '&scm=' +
                    encodeURI(selectedFunction?.scm) +
                    '&function_name=' +
                    encodeURI(selectedFunction?.function_name)
            );
            setMetaData(response?.metadata_function);
            setReadme(response?.readme_content);
            setVersions(response?.versions);
            setFiles([...response?.s3_object_keys] || []);
        } catch (e) {
            return;
        }
    };

    const renderNoFunctionDetails = (
        <div className="no-function-to-display">
            <PlaceholderFunctionsIcon width={150} alt="placeholderFunctions" />
            <p className="title">There is no available Reamde file</p>
        </div>
    );

    const buildTree = (files) => {
        files = files.sort((a, b) => a.localeCompare(b));
        let tree = [];
        let root = {};
        files.forEach((filePath, index) => {
            const pathParts = filePath.split('/');
            if (pathParts.length === 1) {
                root = {
                    title: pathParts[0],
                    key: `index-${index}`,
                    icon: <GoFileDirectoryFill style={{ color: '#B9DAF0' }} />,
                    children: []
                };
                tree.push(root);
            } else {
                let parent = root;
                for (let i = 1; i < pathParts.length; i++) {
                    let found = false;
                    for (let j = 0; j < parent.children?.length; j++) {
                        if (parent.children[j].title === pathParts[i]) {
                            parent = parent.children[j];
                            found = true;
                            break;
                        }
                    }
                    if (!found && i < pathParts.length - 1) {
                        const newChild = {
                            title: pathParts[i],
                            key: index + '-' + i,
                            icon: <GoFileDirectoryFill style={{ color: '#B9DAF0' }} />,
                            children: []
                        };
                        parent.children.push(newChild);
                        parent = newChild;
                    }
                    if (i === pathParts.length - 1) {
                        parent.children.push({
                            title: pathParts[i],
                            key: index,
                            icon: <BsFileEarmarkCode />
                        });
                    }
                }
            }
        });
        setTreeData(tree);
    };

    const onSelect = async (selectedKeys, info) => {
        const path = !isNaN(selectedKeys[0]) ? files[selectedKeys[0]] : null;
        if (!path) return;
        try {
            setIsFileContentLoading(true);
            const response = await httpRequest(
                'GET',
                ApiEndpoints.GET_FUNCTION_FILE_CODE +
                    '?repo=' +
                    encodeURI(metaData?.repo) +
                    '&branch=' +
                    encodeURI(metaData?.branch) +
                    '&owner=' +
                    encodeURI(metaData?.owner) +
                    '&scm=' +
                    encodeURI(metaData?.scm) +
                    '&function_name=' +
                    encodeURI(metaData?.function_name) +
                    '&path=' +
                    encodeURI(path)
            );
            setFileContent(response?.content);
        } catch (e) {
        } finally {
            setIsFileContentLoading(false);
        }
    };

    return (
        <div className="function-drawer-container">
            {onBackToFunction && (
                <div className="back-to-function" onClick={onBackToFunction}>
                    <ArrowBackIcon />
                    <span>Back to function</span>
                </div>
            )}

            <div className="drawer-header ">
                {selectedFunction?.image ? (
                    <img src={selectedFunction?.image} alt="Function icon" height="120px" width="120px" />
                ) : (
                    <FunctionIcon alt="Function icon" height="120px" width="120px" />
                )}

                <div className="right-side">
                    <div className="title">{selectedFunction?.function_name}</div>
                    <div>
                        <deatils is="x3d">
                            <div className="function-owner">
                                {selectedFunction?.owner === OWNER && <MemphisFunctionIcon alt="Memphis function icon" height="15px" />}
                                <owner is="x3d">{selectedFunction?.owner === OWNER ? 'Memphis.dev' : selectedFunction?.owner}</owner>
                            </div>
                            <Divider type="vertical" />
                            {selectedFunction.owner === OWNER && (
                                <>
                                    <downloads is="x3d">
                                        <BiDownload className="download-icon" />
                                        <label>{Number(180).toLocaleString()}</label>
                                    </downloads>
                                    <Divider type="vertical" />
                                    <rate is="x3d">
                                        <Rate disabled defaultValue={5} className="stars-rate" />
                                        <label>(50)</label>
                                    </rate>
                                    <Divider type="vertical" />
                                </>
                            )}
                            <commits is="x3d">
                                <FiGitCommit />
                                <label>Last commit on {parsingDate(selectedFunction?.installed_updated_at, false, false)}</label>
                            </commits>
                        </deatils>
                    </div>
                    <description is="x3d">{selectedFunction?.description}</description>
                    <actions is="x3d">
                        <div className="action-section-btn">
                            <div className="header-flex">
                                <Button
                                    placeholder="Attach"
                                    width={'100px'}
                                    backgroundColorType={'purple'}
                                    colorType={'white'}
                                    radiusType={'circle'}
                                    fontSize="12px"
                                    fontFamily="InterSemiBold"
                                    onClick={() => clickApply('attach')}
                                    disabled={selectedFunction?.install_in_progress || !installed}
                                />
                            </div>
                            <div className="header-flex">
                                <Button
                                    placeholder={
                                        selectedFunction?.install_in_progress ? (
                                            ''
                                        ) : installed ? (
                                            <div className="code-btn">
                                                <MdOutlineFileDownloadOff className="Uninstall" />
                                                <label>Uninstall</label>
                                            </div>
                                        ) : (
                                            <div className="code-btn">
                                                <BiDownload className="Install" />
                                                <label>Install</label>
                                            </div>
                                        )
                                    }
                                    width={'100px'}
                                    backgroundColorType="purple"
                                    colorType={'white'}
                                    radiusType={'circle'}
                                    fontSize="12px"
                                    fontFamily="InterSemiBold"
                                    onClick={() => (installed ? handleUnInstall() : handleInstall())}
                                    isLoading={selectedFunction?.install_in_progress}
                                    disabled={!selectedFunction?.is_valid || selectedFunction?.install_in_progress}
                                />
                            </div>
                        </div>
                        <SelectComponent
                            colorType="black"
                            backgroundColorType="none"
                            radiusType="circle"
                            borderColorType="gray"
                            height="32px"
                            width={'150px'}
                            popupClassName="select-options"
                            fontSize="12px"
                            fontFamily="InterSemiBold"
                            value={`Version: ${selectedVersion}`}
                            disabled={!installed}
                            onChange={(e) => {
                                setSelectedVersion(e);
                            }}
                            options={versions}
                        />
                    </actions>
                </div>
            </div>
            <div>
                <CustomTabs tabs={['Details', 'Code']} value={tabValue} onChange={(tabValue) => setTabValue(tabValue)} />
            </div>
            <Modal width={'75vw'} height={'80vh'} clickOutside={() => setIsTestFunctionModalOpen(false)} open={isTestFunctionModalOpen} displayButtons={false}>
                <TestMockEvent functionDetails={selectedFunction} open={isTestFunctionModalOpen} />
            </Modal>
            {tabValue === 'Details' && (
                <code is="x3d">
                    {/* <Spinner /> */}
                    <span className="readme">
                        {readme === '' ? renderNoFunctionDetails : <ReactMarkdown rehypePlugins={[rehypeRaw, remarkGfm]}>{emojiSupport(readme)}</ReactMarkdown>}
                    </span>
                    <Divider type="vertical" />
                    <span className="function-details">
                        <div>
                            <deatils is="x3d">
                                <label className="label-title">Information</label>
                                <info is="x3d">
                                    <repo is="x3d">
                                        <GoRepo />
                                        <label>{selectedFunction?.repo}</label>
                                    </repo>
                                    <branch is="x3d">
                                        <GithubBranchIcon />
                                        <label>{selectedFunction?.branch}</label>
                                    </branch>
                                    {selectedFunction?.is_valid && (
                                        <language is="x3d">
                                            <CodeBlackIcon />
                                            <label>{selectedFunction?.language}</label>
                                        </language>
                                    )}
                                </info>
                            </deatils>
                            <Divider />
                            <label className="label-title">Social</label>
                            <deatils is="x3d">
                                {selectedFunction.owner === OWNER && (
                                    <>
                                        <downloads is="x3d">
                                            <BiDownload className="download-icon" />
                                            <label>{Number(180).toLocaleString()}</label>
                                        </downloads>
                                        <Divider type="vertical" />
                                        <rate is="x3d">
                                            <Rate disabled defaultValue={5} className="stars-rate" />
                                            <label>(50)</label>
                                        </rate>
                                        <Divider type="vertical" />
                                    </>
                                )}
                                <commits is="x3d">
                                    <FiGitCommit />
                                    <label>Last commit on {parsingDate(selectedFunction?.installed_updated_at, false, false)}</label>
                                </commits>
                            </deatils>
                            {selectedFunction?.is_valid && (
                                <>
                                    <Divider />
                                    <label className="label-title">Tags</label>
                                    <TagsList tagsToShow={3} tags={selectedFunction?.tags} entityType="function" entityName={selectedFunction?.function_name} />
                                </>
                            )}
                        </div>
                    </span>
                </code>
            )}
            {tabValue === 'Code' && (
                <div className="source-code">
                    {/* <Spinner /> */}
                    <div>
                        <label className="source-code-title">Code tree</label>
                        <div className="repos-section">
                            <Tree
                                showLine={false}
                                showIcon={true}
                                defaultExpandedKeys={['0-0-0']}
                                treeData={treeData}
                                onSelect={onSelect}
                                switcherIcon={({ expanded }) => (
                                    <CollapseArrowIcon className={expanded ? 'collapse-arrow open arrow' : 'collapse-arrow arrow'} alt="collapse-arrow" />
                                )}
                                defaultExpandAll={true}
                                // selectedKeys={[selectedFileTreeKey]}
                            />
                        </div>
                    </div>
                    <div className="code-content-section">
                        {/* {renderNoFunctionDetails} */}
                        <>
                            <Button
                                placeholder="Test"
                                width={'100px'}
                                backgroundColorType={'orange'}
                                colorType={'black'}
                                radiusType={'circle'}
                                fontSize="12px"
                                fontFamily="InterSemiBold"
                                onClick={() => setIsTestFunctionModalOpen(true)}
                                disabled={!installed}
                            />
                            <div className="code-content">
                                {isFileContentLoading ? (
                                    <Spinner />
                                ) : (
                                    <Editor
                                        options={{
                                            minimap: { enabled: false },
                                            scrollbar: { verticalScrollbarSize: 0, horizontalScrollbarSize: 0 },
                                            scrollBeyondLastLine: false,
                                            roundedSelection: false,
                                            formatOnPaste: true,
                                            formatOnType: true,
                                            readOnly: true,
                                            fontSize: '12px',
                                            fontFamily: 'Inter'
                                        }}
                                        language={'javascript'}
                                        height="calc(100% - 10px)"
                                        width="calc(100% - 25px)"
                                        value={fileContent}
                                    />
                                )}
                            </div>
                        </>
                    </div>
                </div>
            )}
        </div>
    );
}

export default FunctionDetails;
