export default function AgentUI() {
  return (
    <div className='flex flex-col h-screen bg-gray-50 text-gray-800'>
      {/* Top Bar */}
      <div className='flex items-center justify-between px-4 py-2 border-b bg-white'>
        <span className='font-semibold'>CHAT</span>

        <div className='flex gap-3 text-gray-500'>
          <button>＋</button>
          <button>⚙️</button>
          <button>⋯</button>
          <button>⛶</button>
          <button>✕</button>
        </div>
      </div>

      {/* Center Content */}
      <div className='flex flex-1 flex-col items-center justify-center text-center px-6'>
        <div className='bg-blue-100 p-4 rounded-2xl mb-4'>💬✨</div>

        <h1 className='text-2xl font-semibold mb-2'>Build with Agent</h1>

        <p className='text-gray-500 mb-3'>AI responses may be inaccurate.</p>

        <button className='text-blue-600 font-medium hover:underline'>
          Generate Agent Instructions
        </button>

        <p className='text-gray-400 mt-1'>to onboard AI onto your codebase.</p>
      </div>

      {/* Bottom Input */}
      <div className='p-4 bg-white border-t'>
        <div className='flex items-center gap-2 border rounded-xl px-3 py-2 shadow-sm'>
          <button className='text-gray-500'>📎</button>

          <input
            className='flex-1 outline-none bg-transparent'
            placeholder='Describe what to build next'
          />

          <button className='text-blue-600 font-semibold'>➤</button>
        </div>

        <div className='flex gap-4 mt-2 text-sm text-gray-500'>
          <span>Agent ▼</span>
          <span>Auto ▼</span>
        </div>
      </div>
    </div>
  );
}
