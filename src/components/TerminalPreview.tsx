import type { Palette } from '../types/palette';

type TerminalPreviewProps = {
  palette: Palette;
};

export const TerminalPreview = ({ palette }: TerminalPreviewProps) => (
  <div
    className="rounded-xl overflow-hidden shadow-2xl border border-neutral-800 font-mono text-sm md:text-base relative"
    style={{ backgroundColor: palette.background.css, color: palette.foreground.css }}
  >
    <div className="flex items-center gap-2 px-4 py-3 bg-white/5 border-b border-white/5">
      <div className="flex gap-2">
        <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
        <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
        <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
      </div>
      <div className="ml-4 text-xs opacity-50 flex-1 text-center">user@oklch-term:~</div>
    </div>

    <div className="p-6 space-y-6 overflow-x-auto">
      <div className="space-y-1">
        <div className="text-xs opacity-50 mb-2 uppercase tracking-wider">Status Badges & Backgrounds</div>
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-xs font-bold" style={{ backgroundColor: palette.normal.red.css, color: palette.bright.white.css }}> ERROR </span>
            <span className="text-xs">Connection failed</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-xs font-bold" style={{ backgroundColor: palette.normal.yellow.css, color: palette.badgeBlack.css }}> WARN </span>
            <span className="text-xs">Disk usage high</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-xs font-bold" style={{ backgroundColor: palette.normal.blue.css, color: palette.bright.white.css }}> INFO </span>
            <span className="text-xs">Update available</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-xs font-bold" style={{ backgroundColor: palette.normal.green.css, color: palette.badgeBlack.css }}> PASS </span>
            <span className="text-xs">All tests passed</span>
          </div>
        </div>
        <div className="mt-3 font-mono text-xs border border-white/5 rounded p-2">
          <div className="flex">
            <span style={{ color: palette.dim.white.css, width: '20px' }}>1</span>
            <span> function calculateTotal(a, b) {'{'}</span>
          </div>
          <div className="flex" style={{ backgroundColor: `color-mix(in srgb, ${palette.normal.red.css} 20%, transparent)` }}>
            <span style={{ color: palette.dim.white.css, width: '20px' }}>2</span>
            <span style={{ color: palette.bright.red.css }}>-   return a + b;</span>
          </div>
          <div className="flex" style={{ backgroundColor: `color-mix(in srgb, ${palette.normal.green.css} 20%, transparent)` }}>
            <span style={{ color: palette.dim.white.css, width: '20px' }}>2</span>
            <span style={{ color: palette.bright.green.css }}>+   return (a + b) * 100;</span>
          </div>
          <div className="flex">
            <span style={{ color: palette.dim.white.css, width: '20px' }}>3</span>
            <span> {'}'}</span>
          </div>
        </div>
      </div>

      <div className="space-y-1 border-t border-white/5 pt-4">
        <div className="flex flex-wrap gap-2">
          <span style={{ color: palette.normal.blue.css }}>➜</span>
          <span style={{ color: palette.normal.cyan.css }}>~/projects/color-scheme</span>
          <span style={{ color: palette.normal.yellow.css }}>git:(</span>
          <span style={{ color: palette.normal.red.css }}>main</span>
          <span style={{ color: palette.normal.yellow.css }}>)</span>
          <span>ls -la --color=auto</span>
        </div>
        <div className="grid grid-cols-[auto_auto_1fr] gap-x-4 gap-y-1 opacity-90 text-sm">
          <span style={{ color: palette.normal.blue.css }}>drwxr-xr-x</span> <span style={{ color: palette.bright.black.css }}>4.0K</span> <span style={{ color: palette.normal.blue.css }}>.</span>
          <span style={{ color: palette.normal.blue.css }}>drwxr-xr-x</span> <span style={{ color: palette.bright.black.css }}>4.0K</span> <span style={{ color: palette.normal.blue.css }}>..</span>
          <span style={{ color: palette.normal.white.css }}>-rw-r--r--</span> <span style={{ color: palette.bright.black.css }}>1.2K</span> <span>LICENSE</span>
          <span style={{ color: palette.normal.green.css }}>-rwxr-xr-x</span> <span style={{ color: palette.bright.black.css }}>755</span> <span style={{ color: palette.normal.green.css }}>install.sh</span>
          <span style={{ color: palette.normal.blue.css }}>drwxr-xr-x</span> <span style={{ color: palette.bright.black.css }}>4.0K</span> <span style={{ color: palette.bright.blue.css }}>src/</span>
          <span style={{ color: palette.normal.magenta.css }}>lrwxrwxrwx</span> <span style={{ color: palette.bright.black.css }}>  24</span> <span style={{ color: palette.bright.cyan.css }}>config -&gt; /etc/app/config</span>
        </div>
      </div>

      <div className="space-y-1 border-t border-white/5 pt-4">
        <div className="flex gap-2">
          <span style={{ color: palette.normal.blue.css }}>➜</span>
          <span>git log --graph --oneline --decorate</span>
        </div>
        <div className="text-sm font-mono leading-relaxed">
          <div>
            <span style={{ color: palette.normal.red.css }}>*</span> <span style={{ color: palette.bright.yellow.css }}>a1b2c3d</span> <span style={{ color: palette.bright.cyan.css }}>(HEAD -&gt; main, origin/main)</span> <span>Feat: Add hex input support</span>
          </div>
          <div>
            <span style={{ color: palette.dim.red.css }}>*</span> <span style={{ color: palette.dim.yellow.css }}>e5f6g7h</span> <span style={{ color: palette.dim.white.css }}>Fix: Improve contrast ratio for accessibility</span>
          </div>
          <div>
            <span style={{ color: palette.dim.red.css }}>|</span> <span style={{ color: palette.dim.red.css }}>\</span>
          </div>
          <div>
            <span style={{ color: palette.dim.red.css }}>|</span> <span style={{ color: palette.dim.red.css }}> *</span> <span style={{ color: palette.dim.yellow.css }}>i8j9k0l</span> <span style={{ color: palette.dim.green.css }}>(tag: v1.0.0)</span> <span style={{ color: palette.dim.white.css }}>Release: Initial stable version</span>
          </div>
          <div>
            <span style={{ color: palette.normal.red.css }}>*</span> <span style={{ color: palette.normal.red.css }}> |</span> <span style={{ color: palette.bright.yellow.css }}>m1n2o3p</span> <span>Docs: Update README.md</span>
          </div>
          <div>
            <span style={{ color: palette.normal.red.css }}>|</span><span style={{ color: palette.normal.red.css }}>/</span>
          </div>
          <div>
            <span style={{ color: palette.normal.red.css }}>*</span> <span style={{ color: palette.bright.yellow.css }}>q4r5s6t</span> <span>Init: Project setup</span>
          </div>
        </div>
      </div>

      <div className="space-y-1 border-t border-white/5 pt-4">
        <div className="flex gap-2">
          <span style={{ color: palette.normal.blue.css }}>➜</span>
          <span>npm run build</span>
        </div>
        <div className="text-sm">
          <div style={{ color: palette.bright.black.css }}>&gt; terminal-app@0.1.0 build</div>
          <div style={{ color: palette.bright.black.css }}>&gt; react-scripts build</div>
          <div className="mt-2">Creating an optimized production build...</div>
          <div className="mt-1">
            <span style={{ color: palette.bright.green.css }}>[SUCCESS]</span> Compiled successfully in 2.4s.
          </div>
          <div className="mt-1">
            <span style={{ color: palette.bright.yellow.css }}>[WARN]</span> <span style={{ textDecoration: 'underline' }}>src/App.js</span>: Unused variable 'setCount'
          </div>
          <div className="mt-1" style={{ color: palette.dim.white.css }}>
            File sizes after gzip:
          </div>
          <div className="ml-4" style={{ color: palette.dim.white.css }}>
            <span style={{ color: palette.dim.cyan.css }}>45.2 KB</span>  build/static/js/main.js
          </div>
          <div className="ml-4" style={{ color: palette.dim.white.css }}>
            <span style={{ color: palette.dim.magenta.css }}>12.8 KB</span>  build/static/css/main.css
          </div>
        </div>
      </div>

      <div className="mt-4 flex gap-2 items-center border-t border-white/5 pt-4">
        <span style={{ color: palette.normal.blue.css }}>➜</span>
        <span className="animate-pulse w-2.5 h-5 bg-white/50 block"></span>
      </div>
    </div>
  </div>
);
