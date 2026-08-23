import re

with open(r'C:\Users\you03\my-app2\src\pages\ProfilePage.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

target = r'<input type="date" value={scheduleForm.examDate} onChange={e => setScheduleForm({ ...scheduleForm, examDate: e.target.value })} className="w-full border border-gray-200 focus:border-[#3478B8] rounded-xl px-4 py-3 text-sm outline-none transition" required />\n              </div>'
replacement = r'''<input type="date" value={scheduleForm.examDate} onChange={e => setScheduleForm({ ...scheduleForm, examDate: e.target.value })} className="w-full border border-gray-200 focus:border-[#3478B8] rounded-xl px-4 py-3 text-sm outline-none transition" required />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-1">목표 모의고사 풀이 횟수 (예: 5회)</label>
                <input type="number" min="1" value={scheduleForm.targetReadCount} onChange={e => setScheduleForm({ ...scheduleForm, targetReadCount: Number(e.target.value) })} className="w-full border border-gray-200 focus:border-[#3478B8] rounded-xl px-4 py-3 text-sm outline-none transition" required />
              </div>'''

new_content = content.replace(target, replacement)

with open(r'C:\Users\you03\my-app2\src\pages\ProfilePage.jsx', 'w', encoding='utf-8') as f:
    f.write(new_content)
