import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileVideo,
  Loader2,
  Play,
  Send,
  Server,
  Sparkles,
  Upload,
} from 'lucide-react';
import {
  UnsupportedCapabilityError,
  invokeVisualRecogApi,
  requestCapabilityExposure,
  resolveCapabilityApiUrl,
} from './afAgentApi';
import { createObjectUrlStore } from './objectUrlStore';
import './AfAgentWeb.css';

const DEFAULT_INTENT = '视觉识别服务';

const getFieldDescription = (schema, fieldName) => (
  schema?.properties?.[fieldName]?.description || fieldName
);

export default function AfAgentWeb() {
  const [intent, setIntent] = useState(DEFAULT_INTENT);
  const [capabilityInfo, setCapabilityInfo] = useState(null);
  const [capabilityError, setCapabilityError] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [target, setTarget] = useState('小狗');
  const [videoFile, setVideoFile] = useState(null);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [recognitionError, setRecognitionError] = useState('');
  const [resultUrl, setResultUrl] = useState('');
  const resultUrlStoreRef = useRef(null);
  if (!resultUrlStoreRef.current) {
    resultUrlStoreRef.current = createObjectUrlStore();
  }

  const selectedApi = capabilityInfo?.apiDescriptions?.[0] || null;
  const apiUrl = useMemo(() => {
    if (!capabilityInfo || !selectedApi?.name) {
      return '';
    }
    try {
      return resolveCapabilityApiUrl(capabilityInfo, selectedApi.name);
    } catch {
      return '';
    }
  }, [capabilityInfo, selectedApi]);

  useEffect(() => () => {
    resultUrlStoreRef.current?.clear();
  }, []);

  const clearResultUrl = () => {
    resultUrlStoreRef.current.clear();
    setResultUrl('');
  };

  const applyCapability = async () => {
    setIsApplying(true);
    setCapabilityError('');
    setRecognitionError('');
    setCapabilityInfo(null);
    clearResultUrl();
    try {
      const info = await requestCapabilityExposure(intent.trim());
      if (!info.apiDescriptions.length) {
        throw new Error('能力描述缺少可调用 API');
      }
      setCapabilityInfo(info);
    } catch (error) {
      setCapabilityError(
        error instanceof UnsupportedCapabilityError
          ? '当前能力开放平台不支持该能力'
          : error.message || '能力申请失败',
      );
    } finally {
      setIsApplying(false);
    }
  };

  const startRecognition = async () => {
    if (!capabilityInfo || !selectedApi?.name || !videoFile || !target.trim()) {
      setRecognitionError('请上传视频并填写识别目标');
      return;
    }

    setIsRecognizing(true);
    setRecognitionError('');
    clearResultUrl();

    try {
      const blob = await invokeVisualRecogApi({
        capabilityInfo,
        apiName: selectedApi.name,
        videoFile,
        target: target.trim(),
      });
      setResultUrl(resultUrlStoreRef.current.replace(blob));
    } catch (error) {
      setRecognitionError(error.message || '识别失败');
    } finally {
      setIsRecognizing(false);
    }
  };

  return (
    <main className="af-agent-shell">
      <section className="af-agent-workspace">
        <div className="af-agent-heading">
          <div>
            <p className="af-agent-kicker">AF智能体</p>
            <h1>能力开放平台</h1>
          </div>
          <div className="af-agent-status">
            <Server size={16} />
            <span>System Agent</span>
          </div>
        </div>

        <section className="af-agent-panel af-agent-request">
          <label htmlFor="capability-intent">申请能力</label>
          <div className="af-agent-request-row">
            <input
              id="capability-intent"
              value={intent}
              onChange={(event) => setIntent(event.target.value)}
            />
            <button type="button" onClick={applyCapability} disabled={isApplying || !intent.trim()}>
              {isApplying ? <Loader2 className="af-agent-spin" size={18} /> : <Sparkles size={18} />}
              <span>通过能力开放平台申请能力</span>
            </button>
          </div>
          {capabilityError && (
            <p className="af-agent-message af-agent-error">
              <AlertCircle size={16} />
              <span>{capabilityError}</span>
            </p>
          )}
        </section>

        {capabilityInfo && selectedApi && (
          <section className="af-agent-grid">
            <div className="af-agent-panel af-agent-capability">
              <div className="af-agent-section-title">
                <CheckCircle2 size={18} />
                <span>{selectedApi.title || selectedApi.name}</span>
              </div>
              <p>{selectedApi.description}</p>
              <dl>
                <div>
                  <dt>API</dt>
                  <dd>{selectedApi.name}</dd>
                </div>
                <div>
                  <dt>Endpoint</dt>
                  <dd>{apiUrl}</dd>
                </div>
                <div>
                  <dt>输入</dt>
                  <dd>
                    {getFieldDescription(selectedApi.inputSchema, 'video')}；
                    {getFieldDescription(selectedApi.inputSchema, 'target')}
                  </dd>
                </div>
                <div>
                  <dt>输出</dt>
                  <dd>{selectedApi.outputSchema?.properties?.description?.type || '处理后的视频文件'}</dd>
                </div>
              </dl>
            </div>

            <div className="af-agent-panel af-agent-invoke">
              <div className="af-agent-section-title">
                <FileVideo size={18} />
                <span>调用能力</span>
              </div>
              <label className="af-agent-upload" htmlFor="visual-recog-video">
                <Upload size={20} />
                <span>{videoFile ? videoFile.name : '上传 mp4 视频'}</span>
                <input
                  id="visual-recog-video"
                  type="file"
                  accept="video/mp4"
                  onChange={(event) => setVideoFile(event.target.files?.[0] || null)}
                />
              </label>
              <label className="af-agent-target" htmlFor="visual-recog-target">
                <span>识别目标</span>
                <input
                  id="visual-recog-target"
                  value={target}
                  onChange={(event) => setTarget(event.target.value)}
                  placeholder="例如：红色的盒子"
                />
              </label>
              <button
                type="button"
                className="af-agent-primary"
                onClick={startRecognition}
                disabled={isRecognizing || !videoFile || !target.trim()}
              >
                {isRecognizing ? <Loader2 className="af-agent-spin" size={18} /> : <Play size={18} />}
                <span>开始识别</span>
              </button>
              {recognitionError && (
                <p className="af-agent-message af-agent-error">
                  <AlertCircle size={16} />
                  <span>{recognitionError}</span>
                </p>
              )}
            </div>
          </section>
        )}

        {resultUrl && (
          <section className="af-agent-panel af-agent-result">
            <div className="af-agent-section-title">
              <Send size={18} />
              <span>识别结果</span>
            </div>
            <video src={resultUrl} controls />
            <a href={resultUrl} download="visual_recog_result.mp4">
              <Download size={18} />
              <span>下载结果视频</span>
            </a>
          </section>
        )}
      </section>
    </main>
  );
}
