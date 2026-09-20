import React, { useState } from 'react';
import { FileText, Plus, Trash2, Sparkles, CheckCircle2, Loader2, Copy } from 'lucide-react';
import { aiApi } from '../api/aiApi';

const COVER_LETTER_TAGS = [
  '지원동기', '직무역량', '실수 경험', '개선 경험', 
  '협업 경험', '문제 해결 경험', '성격의 장단점', '입사 후 포부'
];

const CoverLetterPage = () => {
  const [selectedTags, setSelectedTags] = useState([]);
  const [experiences, setExperiences] = useState([{ id: 1, text: '' }]);
  const [companyName, setCompanyName] = useState('');
  const [jobRole, setJobRole] = useState('');
  const [pros, setPros] = useState('');
  const [cons, setCons] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState('');

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const addExperience = () => {
    const newId = experiences.length > 0 ? experiences[experiences.length - 1].id + 1 : 1;
    setExperiences([...experiences, { id: newId, text: '' }]);
  };

  const updateExperience = (id, text) => {
    setExperiences(experiences.map(exp => exp.id === id ? { ...exp, text } : exp));
  };

  const removeExperience = (id) => {
    setExperiences(experiences.filter(exp => exp.id !== id));
  };

  const handleGenerate = async () => {
    if (!companyName.trim() || !jobRole.trim()) {
      alert('지원 기업명과 직무를 입력해주세요.');
      return;
    }
    if (selectedTags.length === 0) {
      alert('최소 1개 이상의 자소서 항목을 선택해주세요.');
      return;
    }
    const validExperiences = experiences.filter(exp => exp.text.trim().length > 0).map(exp => exp.text);
    if (validExperiences.length === 0) {
      alert('최소 1개 이상의 경험을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setResult('');
    try {
      const response = await aiApi.getCoverLetter({
        companyName,
        jobRole,
        tags: selectedTags,
        experiences: validExperiences,
        pros,
        cons,
        additionalInfo
      });
      setResult(response.data.content);
    } catch (error) {
      console.error(error);
      alert('자소서 생성 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };


  const handleFinalize = async () => {
    setIsLoading(true);
    setResult('');
    try {
      const validExperiences = experiences.filter(exp => exp.text.trim().length > 0).map(exp => exp.text);
      const response = await aiApi.getCoverLetter({
        companyName,
        jobRole,
        tags: selectedTags,
        experiences: validExperiences,
        pros,
        cons,
        additionalInfo,
        isFinal: true
      });
      setResult(response.data.content);
    } catch (error) {
      console.error(error);
      alert('최종 자소서 생성 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {

    navigator.clipboard.writeText(result);
    alert('클립보드에 복사되었습니다.');
  };

  return (
    <div className="w-full min-h-[calc(100vh-64px)] bg-slate-50 p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-10">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100">
          <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center">
            <FileText className="text-indigo-600 w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-800">AI 자기소개서 작성</h1>
            <p className="text-gray-500 font-medium mt-1">경험과 키워드를 조합하여 맞춤형 자소서를 완성해보세요!</p>
          </div>
        </div>

        {/* Basic Info */}
        <div className="mb-10">
          <h2 className="text-lg font-black text-slate-700 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-sm">1</span>
            지원 정보 입력
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-2">지원 기업명</label>
              <input 
                type="text" 
                placeholder="예: 네이버, 카카오" 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-2">지원 직무</label>
              <input 
                type="text" 
                placeholder="예: 백엔드 개발자" 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                value={jobRole}
                onChange={(e) => setJobRole(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Tags Selection */}
        <div className="mb-10">
          <h2 className="text-lg font-black text-slate-700 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-sm">2</span>
            자기소개서 작성 항목 선택
          </h2>
          <p className="text-sm text-gray-500 font-medium mb-4">이번 자소서에 포함할 항목들을 모두 선택해주세요.</p>
          <div className="flex flex-wrap gap-2 md:gap-3">
            {COVER_LETTER_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all border ${
                  selectedTags.includes(tag) 
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200' 
                  : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600'
                }`}
              >
                {tag}
                {selectedTags.includes(tag) && <CheckCircle2 className="inline-block w-4 h-4 ml-1.5 -mt-0.5" />}
              </button>
            ))}
          </div>
        </div>

        {/* Experiences Input */}
        <div className="mb-10">
          <h2 className="text-lg font-black text-slate-700 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-sm">3</span>
            나의 경험 추가
          </h2>
          <p className="text-sm text-gray-500 font-medium mb-4">선택한 항목들을 뒷받침할 수 있는 핵심 경험을 간단히 키워드나 문장으로 적어주세요.</p>
          
          <div className="space-y-4">
            {experiences.map((exp, index) => (
              <div key={exp.id} className="flex gap-3 items-start">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-indigo-500 mb-1 ml-1">경험 {index + 1}</label>
                  <input 
                    type="text" 
                    placeholder="예: 졸업 프로젝트에서 MSA 구조를 도입하여 트래픽 병목 현상을 해결함" 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-sm"
                    value={exp.text}
                    onChange={(e) => updateExperience(exp.id, e.target.value)}
                  />
                </div>
                {experiences.length > 1 && (
                  <button 
                    onClick={() => removeExperience(exp.id)}
                    className="mt-6 p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <button 
            onClick={addExperience}
            className="mt-4 flex items-center justify-center gap-2 w-full py-4 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 font-bold hover:bg-gray-50 hover:border-gray-300 hover:text-gray-600 transition-all text-sm"
          >
            <Plus className="w-4 h-4" /> 경험 추가하기
          </button>
        </div>


        {/* Pros & Cons Input */}
        <div className="mb-10">
          <h2 className="text-lg font-black text-slate-700 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-sm">4</span>
            성격의 장단점 (선택)
          </h2>
          <p className="text-sm text-gray-500 font-medium mb-4">자소서 항목에 '성격의 장단점'이 포함된 경우, 활용할 장단점 키워드를 적어주세요. AI 피드백을 받고 나서 내용을 자유롭게 수정 후 다시 생성할 수 있습니다.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-2">장점</label>
              <input 
                type="text" 
                placeholder="예: 꼼꼼함, 책임감" 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-sm"
                value={pros}
                onChange={(e) => setPros(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-2">단점</label>
              <input 
                type="text" 
                placeholder="예: 거절을 잘 못함 (보완 방법 포함)" 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-sm"
                value={cons}
                onChange={(e) => setCons(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* AI Generate Button */}
        <div className="mt-12 pt-8 border-t border-gray-100">
          <button 
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full bg-slate-800 hover:bg-slate-900 text-white font-black py-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 text-lg disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5 text-yellow-400" />}
            {isLoading ? 'AI가 자소서를 작성하는 중...' : 'AI 자소서 초안 생성하기'}
          </button>
          <p className="text-center text-xs text-gray-400 font-medium mt-3">입력된 정보를 바탕으로 AI가 최적의 초안을 작성합니다.</p>
        </div>


        {/* Result Area */}
        {result && (
          <div className="mt-10 p-8 bg-indigo-50/50 rounded-3xl border border-indigo-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-indigo-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                완성된 AI 자소서 초안
              </h2>
              <button onClick={copyToClipboard} className="text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-indigo-100">
                <Copy className="w-4 h-4" /> 복사하기
              </button>
            </div>
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700 bg-white p-6 rounded-2xl border border-indigo-100 shadow-sm mb-6">
              {result}
            </div>
            
            {/* Additional Feedback Section */}
            <div className="bg-white p-6 rounded-2xl border border-indigo-100 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 mb-2">💡 추가 피드백 및 수정 요청</h3>
              <p className="text-xs text-gray-500 mb-3">결과물에 대해 더 추가하고 싶은 내용이나, 다르게 작성되었으면 하는 방향(예: "협업 경험을 조금 더 강조해줘")을 적어주세요.</p>
              <textarea 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-sm min-h-[100px] resize-none"
                placeholder="추가 요청사항을 입력하세요..."
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
              />
              <button 
                onClick={handleGenerate}
                disabled={isLoading}
                className="mt-3 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-indigo-200" />}
                {isLoading ? '피드백 반영 중...' : '추가 내용 반영해서 다시 생성하기'}
              </button>
              
              <button 
                onClick={handleFinalize}
                disabled={isLoading}
                className="mt-3 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4 text-green-200" />}
                {isLoading ? '최종 완성 중...' : '자소서 완성하기 (피드백 없이 본문만 출력)'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default CoverLetterPage;
