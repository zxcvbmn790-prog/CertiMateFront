import { useState } from 'react';
import { aiApi } from '../api/aiApi';
import { userApi } from '../api/userApi';
import { examApi } from '../api/examApi';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Send, CheckCircle2, RotateCcw, ChevronDown, ChevronUp, Award } from 'lucide-react';

const TAGS = [
  '#비전공자', '#전공자', '#IT초보', '#개발자취업',
  '#데이터분석', '#백엔드', '#프론트엔드', '#보안/인프라',
  '#공기업준비', '#단기간취득', '#실무도움', '#스펙업',
  '#클라우드', '#인공지능/AI', '#네트워크', '#DB관리',
  '#모바일앱', '#웹퍼블리셔', '#게임개발', '#빅데이터',
  '#시스템엔지니어', '#PM/기획', '#이직준비', '#국비지원',
  '#해외취업', '#대기업준비', '#스타트업', '#취미/교양'
];

const RecommendationPage = () => {
  const [selectedTags, setSelectedTags] = useState([]);
  const [customInput, setCustomInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedCertName, setSelectedCertName] = useState('');
  const [examDate, setExamDate] = useState('');
  const [examType, setExamType] = useState('필기');
  const [targetReadCount, setTargetReadCount] = useState(1);
  const navigate = useNavigate();

  const [globalSchedules, setGlobalSchedules] = useState([]);
  const [isLoadingSchedules, setIsLoadingSchedules] = useState(false);

  const handleCardClick = async (certName) => {
    setSelectedCertName(certName);
    setExamDate('');
    setExamType('필기');
    setTargetReadCount(1);
    setGlobalSchedules([]);
    setShowScheduleModal(true);
    setIsLoadingSchedules(true);
    try {
        const res = await aiApi.ensureCert(certName);
        const certId = res.data.certId;
        const schRes = await examApi.getGlobalSchedules(certId);
        setGlobalSchedules(schRes.data.data || []);
    } catch(e) {
        console.error(e);
    } finally {
        setIsLoadingSchedules(false);
    }
  };

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = async () => {
    if (selectedTags.length === 0 && !customInput.trim()) {
      alert('해시태그를 선택하거나 관심사를 입력해주세요!');
      return;
    }
    
    setIsLoading(true);
    setResult('');
    setShowDetails(false);
    try {
      const response = await aiApi.getRecommendation({
        tags: selectedTags,
        customInput: customInput.trim()
      });
      setResult(response.data.recommendationResult);
    } catch (error) {
      console.error(error);
      setResult('AI 응답을 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 py-10 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-100 text-indigo-600 rounded-full mb-4">
            <Sparkles size={32} />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-800 mb-4">AI 맞춤형 자격증 추천</h1>
          <p className="text-gray-500 font-medium">나의 상황과 목표를 알려주시면, AI가 가장 완벽한 자격증 로드맵을 그려드립니다.</p>
        </div>

        {/* Form Section */}
        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 mb-8">
          
          {/* Tags */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs mr-2">1</span>
              관심있는 해시태그를 모두 골라주세요
            </h3>
            <div className="flex flex-wrap gap-2">
              {TAGS.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                    selectedTags.includes(tag) 
                    ? 'bg-blue-600 text-white border-transparent shadow-md' 
                    : 'bg-white text-gray-500 border border-gray-200 hover:border-blue-400 hover:text-blue-500'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Text Input */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs mr-2">2</span>
              추가로 궁금한 점이나 현재 스펙을 자유롭게 적어주세요
            </h3>
            <textarea
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="예) 경영학과 3학년인데 데이터 분석 쪽으로 취업하고 싶어요. 파이썬 기초만 알고 있습니다."
              className="w-full h-32 p-4 rounded-2xl border border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none"
            />
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="inline-flex items-center px-8 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-full font-black text-lg transition-colors shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  AI가 분석 중입니다...
                </>
              ) : (
                <>
                  <Send className="mr-2" size={20} /> AI에게 추천받기
                </>
              )}
            </button>
          </div>
        </div>

        {/* Result Section */}
        {result && (
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-[32px] p-6 md:p-10 text-white shadow-xl mb-12 animate-fade-in-up">
            <div className="flex items-center mb-8 border-b border-white/20 pb-4">
              <CheckCircle2 className="text-green-400 mr-3" size={28} />
              <h2 className="text-2xl md:text-3xl font-black">AI 추천 로드맵이 도착했습니다!</h2>
            </div>
            
            <div className="flex flex-col gap-4">
              {(() => {
                try {
                  const parsedResult = JSON.parse(result);
                  if (Array.isArray(parsedResult)) {
                    return (
                      <div className="w-full">
                        
                        {/* Beautiful Compact 3 Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                          {parsedResult.map((item) => (
                            <div key={item.rank} onClick={() => handleCardClick(item.name)} className="bg-white/10 hover:bg-white/15 transition-colors border border-white/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-lg relative overflow-hidden group cursor-pointer" title="클릭하여 일정 추가하기">
                              
                              {/* Decorative rank background */}
                              <div className={`absolute -right-2 -top-6 text-9xl font-black opacity-5 group-hover:opacity-10 transition-opacity ${item.rank === 1 ? 'text-yellow-400' : item.rank === 2 ? 'text-slate-300' : 'text-amber-500'}`}>
                                {item.rank}
                              </div>

                              <div className={`w-14 h-14 rounded-full flex items-center justify-center font-black text-2xl mb-4 shadow-lg z-10 ${item.rank === 1 ? 'bg-gradient-to-br from-yellow-300 to-yellow-500 text-yellow-900' : item.rank === 2 ? 'bg-gradient-to-br from-slate-200 to-slate-400 text-slate-800' : 'bg-gradient-to-br from-amber-500 to-amber-700 text-amber-100'}`}>
                                {item.rank}
                              </div>
                              
                              <div className="text-xs text-indigo-200 font-bold mb-1 z-10">AI 추천 {item.rank}순위</div>
                              <div className="text-xl font-black text-white z-10 break-keep">{item.name}</div>
                            </div>
                          ))}
                        </div>

                        {/* Toggle Button */}
                        <div className="text-center my-8">
                          <span 
                            onClick={() => setShowDetails(!showDetails)}
                            className="inline-flex items-center px-6 py-3 bg-indigo-500/20 hover:bg-indigo-500/40 border border-indigo-400/30 rounded-full text-indigo-200 font-bold transition-all cursor-pointer shadow-sm hover:shadow-md"
                          >
                            {showDetails ? '상세 이유 닫기' : '왜 이 자격증을 추천했는지 궁금하다면?'} 
                            {showDetails ? <ChevronUp size={20} className="ml-2"/> : <ChevronDown size={20} className="ml-2 animate-bounce"/>}
                          </span>
                        </div>

                        {/* Expanded Details - Beautiful modern list */}
                        {showDetails && (
                          <div className="mt-4 space-y-4 text-left animate-fade-in-up">
                            {parsedResult.map((item) => (
                              <div key={item.rank} className="relative bg-white/5 backdrop-blur-sm p-6 md:p-8 rounded-2xl border border-white/10 overflow-hidden shadow-inner">
                                {/* Accent line on left */}
                                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${item.rank === 1 ? 'bg-yellow-400' : item.rank === 2 ? 'bg-slate-300' : 'bg-amber-500'}`}></div>
                                
                                <div className="flex items-center gap-3 mb-3 pl-2">
                                  <span className={`px-3 py-1 rounded-full text-xs font-black ${item.rank === 1 ? 'bg-yellow-400/20 text-yellow-300' : item.rank === 2 ? 'bg-slate-300/20 text-slate-300' : 'bg-amber-500/20 text-amber-400'}`}>
                                    {item.rank}순위
                                  </span>
                                  <h4 className="text-xl font-bold text-white tracking-tight">{item.name}</h4>
                                </div>
                                <p className="text-indigo-100/90 text-sm md:text-base leading-relaxed pl-2">
                                  {item.reason}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  }
                  throw new Error("Not an array");
                } catch (e) {
                  // Fallback for non-JSON string
                  return (
                    <div className="prose prose-invert max-w-none whitespace-pre-wrap leading-relaxed text-sm md:text-base text-gray-200">
                      {result}
                    </div>
                  );
                }
              })()}
            </div>
            
            <div className="mt-10 pt-6 border-t border-white/20 text-center">
              <button 
                onClick={() => { setResult(''); setSelectedTags([]); setCustomInput(''); setShowDetails(false); }}
                className="inline-flex items-center px-6 py-3 bg-white/10 rounded-full text-sm font-bold text-white hover:bg-white/20 transition-colors"
              >
                <RotateCcw size={16} className="mr-2" /> 다른 조건으로 다시 추천받기
              </button>
            </div>
          </div>
        )}


        {/* Schedule Modal */}
        {showScheduleModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative animate-fade-in-up">
              <button 
                onClick={() => setShowScheduleModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
              <h3 className="text-2xl font-black text-slate-800 mb-6 text-center">
                <span className="text-indigo-600">{selectedCertName}</span><br/>일정 추가
              </h3>
              
              <div className="space-y-4">
                {isLoadingSchedules ? (
                    <div className="py-8 flex flex-col items-center justify-center space-y-3">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        <span className="text-sm font-bold text-gray-500">공식 일정을 확인 중입니다...</span>
                    </div>
                ) : globalSchedules.length > 0 ? (
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">공식 시험 일정 선택</label>
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                            {globalSchedules.map((sch) => (
                                <label key={sch.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${examDate === sch.examDate && examType === sch.examType ? 'bg-indigo-50 border-indigo-200' : 'hover:bg-gray-50 border-gray-200'}`}>
                                    <input 
                                        type="radio" 
                                        name="officialSchedule"
                                        checked={examDate === sch.examDate && examType === sch.examType}
                                        onChange={() => {
                                            setExamDate(sch.examDate);
                                            setExamType(sch.examType || '필기');
                                        }}
                                        className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                                    />
                                    <span className="text-sm font-bold text-gray-700">
                                        {sch.examRound ? `[${sch.examRound}] ` : ''}{sch.examType} - <span className="text-indigo-600">{sch.examDate}</span>
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div>
                        <div className="bg-blue-50 border border-blue-100 text-blue-700 p-3 rounded-xl text-sm font-medium mb-4 flex gap-2">
                            <span className="text-blue-500">ℹ️</span> 이 시험은 지정된 공식 일정이 없거나 상시 시험입니다. 목표 일자를 직접 설정하세요.
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">시험 유형</label>
                                <select 
                                    value={examType}
                                    onChange={e => setExamType(e.target.value)}
                                    className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                                >
                                    <option value="필기">필기</option>
                                    <option value="실기">실기</option>
                                    <option value="통합">통합</option>
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">시험 일자</label>
                                <input 
                                    type="date" 
                                    value={examDate}
                                    onChange={e => setExamDate(e.target.value)}
                                    className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                        </div>
                    </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 mt-4">목표 회독 수</label>
                  <input 
                    type="number" 
                    min="1"
                    value={targetReadCount}
                    onChange={e => setTargetReadCount(Number(e.target.value))}
                    className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button 
                  onClick={() => setShowScheduleModal(false)}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
                >
                  취소
                </button>
                <button 
                  onClick={async () => {
                    if(!examDate) { alert("시험 일자를 선택해주세요."); return; }
                    try {
                      // 1. Ensure certification exists
                      const res = await aiApi.ensureCert(selectedCertName);
                      const certId = res.data.certId;
                      // 2. Add to user schedule
                      await userApi.addSchedule({
                        certId, examType, examDate, targetReadCount
                      });
                      alert("일정이 성공적으로 추가되었습니다! 마이페이지로 이동합니다.");
                      navigate('/profile');
                    } catch (e) {
                      console.error(e);
                      if (e.response && e.response.status === 401) {
                         alert("로그인이 필요합니다. 로그인 후 일정을 추가해주세요.");
                      } else {
                         alert("일정 추가 중 오류가 발생했습니다.");
                      }
                    }
                  }}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors"
                >
                  캘린더에 추가
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>

  );
};

export default RecommendationPage;
