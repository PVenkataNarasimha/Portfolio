import { useState, useRef, useEffect } from 'react';
import type { KeyboardEvent } from 'react';
import TerminalSnake from './TerminalSnake';
import './TerminalShell.css';

export interface ColoredText {
  text: string;
  colorClass?: string;
}

interface CommandEntry {
  command: string;
  outputLines?: ColoredText[][];
  isError?: boolean;
  isLoading?: boolean;
  isDone?: boolean;
}

const ASCII_BANNER_GLITCH = `
                                                                                                                                                                  
                                                                                                                                                                  
NNNNNNNN        NNNNNNNN                                                                       iiii                         hhhhhhh                               
N:::::::N       N::::::N                                                                      i::::i                        h:::::h                               
N::::::::N      N::::::N                                                                       iiii                         h:::::h                               
N:::::::::N     N::::::N                                                                                                    h:::::h                               
N::::::::::N    N::::::N  aaaaaaaaaaaaa  rrrrr   rrrrrrrrr   aaaaaaaaaaaaa      ssssssssss   iiiiiii    mmmmmmm    mmmmmmm   h::::h hhhhh         aaaaaaaaaaaaa   
N:::::::::::N   N::::::N  a::::::::::::a r::::rrr:::::::::r  a::::::::::::a   ss::::::::::s  i:::::i  mm:::::::m  m:::::::mm h::::hh:::::hhh      a::::::::::::a  
N:::::::N::::N  N::::::N  aaaaaaaaa:::::ar:::::::::::::::::r aaaaaaaaa:::::ass:::::::::::::s  i::::i m::::::::::mm::::::::::mh::::::::::::::hh    aaaaaaaaa:::::a 
N::::::N N::::N N::::::N           a::::arr::::::rrrrr::::::r         a::::as::::::ssss:::::s i::::i m::::::::::::::::::::::mh:::::::hhh::::::h            a::::a 
N::::::N  N::::N:::::::N    aaaaaaa:::::a r:::::r     r:::::r  aaaaaaa:::::a s:::::s  ssssss  i::::i m:::::mmm::::::mmm:::::mh::::::h   h::::::h    aaaaaaa:::::a 
N::::::N   N:::::::::::N  aa::::::::::::a r:::::r     rrrrrrraa::::::::::::a   s::::::s       i::::i m::::m   m::::m   m::::mh:::::h     h:::::h  aa::::::::::::a 
N::::::N    N::::::::::N a::::aaaa::::::a r:::::r           a::::aaaa::::::a      s::::::s    i::::i m::::m   m::::m   m::::mh:::::h     h:::::h a::::aaaa::::::a 
N::::::N     N:::::::::Na::::a    a:::::a r:::::r          a::::a    a:::::assssss   s:::::s  i::::i m::::m   m::::m   m::::mh:::::h     h:::::ha::::a    a:::::a 
N::::::N      N::::::::Na::::a    a:::::a r:::::r          a::::a    a:::::as:::::ssss::::::si::::::im::::m   m::::m   m::::mh:::::h     h:::::ha::::a    a:::::a 
N::::::N       N:::::::Na:::::aaaa::::::a r:::::r          a:::::aaaa::::::as::::::::::::::s i::::::im::::m   m::::m   m::::mh:::::h     h:::::ha:::::aaaa::::::a 
N::::::N        N::::::N a::::::::::aa:::ar:::::r           a::::::::::aa:::as:::::::::::ss  i::::::im::::m   m::::m   m::::mh:::::h     h:::::h a::::::::::aa:::a
NNNNNNNN         NNNNNNN  aaaaaaaaaa  aaaarrrrrrr            aaaaaaaaaa  aaaa sssssssssss    iiiiiiiimmmmmm   mmmmmm   mmmmmmhhhhhhh     hhhhhhh  aaaaaaaaaa  aaaa
                                                                                                                                                                  
                                                                                                                                                                  
                                                                                                                                                                  
                                                                                                                                                                  
                                                                                                                                                                  
                                                                                                                                                                  
                                                                                                                                                                  
`;

const ASCII_AVATAR = `
.--+##############################################
..------+#########################################
---------------##++--.-#--++######################
---------------+-+.    .......-###################
-+++++--++-----.            ....+#################
++++++++++++++.   ..++###-   ....-++##############
#############+- .+++-...-+#+. .... .##############
##############+ -+-----..-++-. .....##############
##############-.+++#-.--+###..-+-...##############
#############+-.-+###########+-+-...##############
#############+----+++##+--++####-...##############
##############---------.-...####---.##############
################----...-+++---#+----+#############
################--------. .+++#++----#############
################--....----+++#++++---#############
################---.......-++++++++--#############
################++++--..-+##+++++++--#############
##################+++++++##+##+++++--#############
######################++########+----#############
##################################################
##################################################
##################################################
##################################################`

export interface ColoredText {
  text: string;
  colorClass?: string;
}

const COMMAND_MAP: Record<string, ColoredText[][]> = {
  '/help': [
    [{ text: 'AVAILABLE COMMANDS', colorClass: 'accent-title' }],
    [{ text: '/about', colorClass: 'command-highlight' }, { text: '      - Background info' }],
    [{ text: '/experience', colorClass: 'command-highlight' }, { text: ' - Professional history' }],
    [{ text: '/projects', colorClass: 'command-highlight' }, { text: '   - My technical work' }],
    [{ text: '/skills', colorClass: 'command-highlight' }, { text: '     - Tech stack list' }],
    [{ text: '/education', colorClass: 'command-highlight' }, { text: '  - Academic background' }],
    [{ text: '/contact', colorClass: 'command-highlight' }, { text: '    - Get in touch' }],
    [{ text: '/social', colorClass: 'command-highlight' }, { text: '     - Social profiles' }],
    [{ text: '/whoami', colorClass: 'command-highlight' }, { text: '     - Identity dump' }],
    [{ text: '/snake', colorClass: 'command-highlight' }, { text: '      - Play Terminal Snake' }],
    [{ text: '/status', colorClass: 'command-highlight' }, { text: '     - System health' }],
    [{ text: '/clear', colorClass: 'command-highlight' }, { text: '      - Reset terminal view' }],
  ],
  '/snake': [
    [{ text: 'INITIALIZING SNAKE_PROCESS...', colorClass: 'accent-title' }]
  ],
  '/about': [
    [{ text: 'ABOUT ME', colorClass: 'accent-title' }],
    [{ text: "I'm a Driven Full-Stack Developer with hands-on experience building scalable web applications." }],
    [{ text: "I have a strong foundation in debugging, API development, and system design." }],
    [],
    [{ text: "Currently pursuing B.Sc. at BITS Hyderabad." }]
  ],
  '/experience': [
    [{ text: 'PROFESSIONAL EXPERIENCE', colorClass: 'accent-title' }],
    [{ text: 'Full-Stack Developer Intern', colorClass: 'highlight-text' }, { text: ' | Present' }],
    [{ text: '- Building and maintaining React-based web applications.' }],
    [{ text: '- Optimizing backend services and MongoDB schemas.' }],
    [],
    [{ text: 'Android Development Trainee', colorClass: 'highlight-text' }, { text: ' | 2023' }],
    [{ text: '- Specialized in debugging React Native modules.' }],
    [{ text: '- Improved app performance by 20% through efficient state management.' }]
  ],
  '/projects': [
    [{ text: 'PROJECTS', colorClass: 'accent-title' }],
    [{ text: '1. ' }, { text: 'Vehicle Rental System', colorClass: 'highlight-text' }, { text: ' - Full-stack React + Node.js + MongoDB app for booking vehicles.' }],
    [{ text: '2. ' }, { text: 'Android App Development', colorClass: 'highlight-text' }, { text: ' - Debugged routing and UI layout issues to improve app stability.' }]
  ],
  '/skills': [
    [{ text: 'TECHNICAL SKILLS', colorClass: 'accent-title' }],
    [{ text: 'Languages: ', colorClass: 'highlight-text' }, { text: 'JavaScript, TypeScript, Python, Java' }],
    [{ text: 'Frontend: ', colorClass: 'highlight-text' }, { text: 'React, Next.js, HTML5, CSS3, Tailwind' }],
    [{ text: 'Backend: ', colorClass: 'highlight-text' }, { text: 'Node.js, Express.js, RESTful APIs' }],
    [{ text: 'Databases: ', colorClass: 'highlight-text' }, { text: 'MongoDB, PostgreSQL, Redis' }],
    [{ text: 'Tools: ', colorClass: 'highlight-text' }, { text: 'Git, Docker, Firebase, AWS (Basics)' }]
  ],
  '/education': [
    [{ text: 'EDUCATION', colorClass: 'accent-title' }],
    [{ text: 'B.Sc. Computer Science', colorClass: 'highlight-text' }],
    [{ text: 'BITS Hyderabad | Expected 2025' }],
    [],
    [{ text: 'Focus areas: Data Structures, Algorithms, Web Architecture, and Database Management.' }]
  ],
  '/contact': [
    [{ text: 'CONTACT INFO', colorClass: 'accent-title' }],
    [{ text: 'Email: pulipatinarasimha3@gmail.com' }],
    [{ text: 'Phone: +91 6302117235' }],
    [{ text: 'Location: Hyderabad, India' }]
  ],
  '/social': [
    [{ text: 'SOCIAL PROFILES', colorClass: 'accent-title' }],
    [{ text: 'GitHub: ', colorClass: 'highlight-text' }, { text: 'https://github.com/PVenkataNarasimha' }],
    [{ text: 'LinkedIn: ', colorClass: 'highlight-text' }, { text: 'https://linkedin.com/in/narasimha-pulipati' }],
    [{ text: 'Instagram: ', colorClass: 'highlight-text' }, { text: 'https://instagram.com/narasimha_pv' }]
  ],
  '/whoami': [
    [{ text: 'IDENTITY DUMP', colorClass: 'accent-title' }],
    [{ text: 'NAME: ', colorClass: 'highlight-text' }, { text: 'NARASIMHA PULIPATI' }],
    [{ text: 'ROLE: ', colorClass: 'highlight-text' }, { text: 'FULL-STACK ENGINEER' }],
    [{ text: 'STATUS: ', colorClass: 'highlight-text' }, { text: 'ACTIVE / HUNTING FOR BUGS' }],
    [{ text: 'ORIGIN: ', colorClass: 'highlight-text' }, { text: '0xC0FFEE' }]
  ],
  '/status': [
    [{ text: 'SYSTEM STATUS', colorClass: 'accent-title' }],
    [{ text: '[ OK ] Kernel: V1.0.4' }],
    [{ text: '[ OK ] Memory: 16TB (Simulated)' }],
    [{ text: '[ OK ] Uplink: Fiber-Optic' }],
    [{ text: '[ OK ] Matrix Background: Initialized' }]
  ]
};

const TypewriterBlock = ({ lines, isError, onType, onComplete }: { lines: ColoredText[][], isError?: boolean, onType?: () => void, onComplete?: () => void }) => {
  const [charsRevealed, setCharsRevealed] = useState(0);

  const totalChars = lines.reduce((acc, line) => acc + line.reduce((acc2, seg) => acc2 + seg.text.length, 0), 0);

  useEffect(() => {
    let revealed = 0;
    const interval = setInterval(() => {
      revealed += 3; // speed of typing
      setCharsRevealed(revealed);
      if (onType) onType();
      if (revealed >= totalChars) {
        clearInterval(interval);
        if (onComplete) onComplete();
      }
    }, 10);
    return () => clearInterval(interval);
  }, [totalChars, onType, onComplete]);

  let charsAccounted = 0;

  return (
    <div className={isError ? 'error-text' : 'command-output'}>
      {lines.map((line, lIdx) => (
        <div key={lIdx} style={{ minHeight: line.length === 0 ? '1.5em' : 'auto' }}>
          {line.map((seg, sIdx) => {
            const start = charsAccounted;
            const end = start + seg.text.length;
            charsAccounted += seg.text.length;

            if (charsRevealed <= start) return null;

            const visibleText = charsRevealed >= end
              ? seg.text
              : seg.text.substring(0, charsRevealed - start);

            return <span key={sIdx} className={seg.colorClass}>{visibleText}</span>;
          })}
        </div>
      ))}
    </div>
  );
};

interface TerminalShellProps {
  initialCommand?: string;
}

export default function TerminalShell({ initialCommand }: TerminalShellProps) {
  const [history, setHistory] = useState<CommandEntry[]>([]);
  const [inputVal, setInputVal] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isGameActive, setIsGameActive] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'auto' });
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (initialCommand) {
      executeCommand(initialCommand);
    }
  }, [initialCommand]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const COMMANDS = Object.keys(COMMAND_MAP).concat(['/clear', '/snake']);
  const suggestions = COMMANDS.filter(c => c.startsWith(inputVal.toLowerCase()));
  const shouldShowSuggestions = showSuggestions && suggestions.length > 0 && inputVal.startsWith('/');

  const executeCommand = (cmdStr: string) => {
    const cmd = cmdStr.trim();
    if (cmd === '') {
      setHistory((prev: CommandEntry[]) => [...prev, { command: '' }]);
      return;
    }
    if (cmd === '/clear') {
      setHistory([]);
      return;
    }

    // Create history entry in loading state
    setHistory((prev: CommandEntry[]) => [...prev, { command: cmd, isLoading: true }]);

    // Emulate 1-2 second network processing delay
    const delay = Math.floor(Math.random() * 1000) + 1000;

    if (cmd.toLowerCase() === '/snake') {
      setTimeout(() => {
        setIsGameActive(true);
        setHistory((prev: CommandEntry[]) => [...prev.slice(0, -1), { command: cmd, outputLines: [[{ text: 'Launching SNAKE_PROCESS...' }]] }]);
      }, 500);
      return;
    }

    setTimeout(() => {
      const handlerLines = COMMAND_MAP[cmd.toLowerCase()];

      setHistory((prev: CommandEntry[]) => {
        const newHistory = [...prev];
        // find the last loading command
        for (let i = newHistory.length - 1; i >= 0; i--) {
          if (newHistory[i].command === cmd && newHistory[i].isLoading) {
            newHistory[i] = {
              command: cmd,
              isLoading: false,
              outputLines: handlerLines || [[{ text: `Command not found: ${cmd}. Type ` }, { text: '/help', colorClass: 'command-highlight' }, { text: ' for available commands.' }]],
              isError: !handlerLines
            };
            break;
          }
        }
        return newHistory;
      });
    }, delay);
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(0, prev - 1));
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(suggestions.length - 1, prev + 1));
    } else if (e.key === 'Tab') {
      e.preventDefault();
      if (shouldShowSuggestions) {
        setInputVal(suggestions[selectedIndex]);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (shouldShowSuggestions && selectedIndex >= 0 && inputVal !== suggestions[selectedIndex]) {
        // User hit enter after using arrows to highlight a suggestion
        const selectedCmd = suggestions[selectedIndex];
        setInputVal('');
        setShowSuggestions(false);
        setSelectedIndex(0);
        executeCommand(selectedCmd);
      } else {
        // User just hit enter on what they typed
        const cmd = inputVal;
        setInputVal('');
        setShowSuggestions(false);
        setSelectedIndex(0);
        executeCommand(cmd);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputVal(e.target.value);
    setSelectedIndex(0);
    setShowSuggestions(true);
  };

  return (
    <div className="terminal-shell" onClick={() => inputRef.current?.focus()}>
      <div className="history-scroll-area">
        <div className="history-container">
          {/* Dashboard constantly visible at the top */}
          <div className="dashboard-layout" style={{ marginBottom: '24px' }}>
            <pre className="ascii-banner glitch-banner">{ASCII_BANNER_GLITCH}</pre>

            <div className="dashboard-grid glass-dashed">
              {/* Left Column */}
              <div className="dashboard-col left-col">
                <div className="bold-center">Welcome, visitor.</div>
                <pre className="ascii-avatar">{ASCII_AVATAR}</pre>
                <div className="center-text info-text mt-auto">
                  Full-Stack Developer • Hyderabad, India<br />
                  pulipatinarasimha3@gmail.com
                </div>
              </div>

              {/* Right Column */}
              <div className="dashboard-col right-col">
                <div className="section">
                  <div className="section-title">Capabilities</div>
                  <div className="capability-row">
                    <span className="capability-label">Languages</span>
                    <span className="capability-val">JavaScript, TypeScript, Python</span>
                  </div>
                  <div className="capability-row">
                    <span className="capability-label">Frontend</span>
                    <span className="capability-val">React, HTML, CSS</span>
                  </div>
                  <div className="capability-row">
                    <span className="capability-label">Backend</span>
                    <span className="capability-val">Node.js, Express.js</span>
                  </div>
                  <div className="capability-row">
                    <span className="capability-label">Databases</span>
                    <span className="capability-val">MongoDB, SQL</span>
                  </div>
                </div>

                <div className="section bottom-section">
                  <div className="section-title">Navigation</div>
                  <div className="nav-links">
                    <div className="nav-item">/about</div>
                    <div className="nav-item">/projects</div>
                    <div className="nav-item">/skills</div>
                    <div className="nav-item">/contact</div>
                  </div>
                  <div className="nav-hint mt-auto">
                    ... /help for all commands<br />
                    Try /clear to reset view
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Console History Output */}
          {history.map((entry: CommandEntry, idx: number) => (
            <div key={idx} className="history-entry">
              <div className="prompt-line">
                <span className="prompt-symbol">&gt;</span>
                <span className="entered-command">{entry.command}</span>
              </div>
              {entry.isLoading ? (
                <div className="loading-text">Searching<span className="loading-dots">...</span></div>
              ) : entry.outputLines ? (
                entry.isDone ? (
                  <div className={entry.isError ? 'error-text' : 'command-output'}>
                    {entry.outputLines.map((line, lIdx) => (
                      <div key={lIdx} style={{ minHeight: line.length === 0 ? '1.5em' : 'auto' }}>
                        {line.map((seg, sIdx) => (
                          <span key={sIdx} className={seg.colorClass}>{seg.text}</span>
                        ))}
                      </div>
                    ))}
                  </div>
                ) : (
                  <TypewriterBlock 
                    lines={entry.outputLines} 
                    isError={entry.isError} 
                    onType={scrollToBottom}
                    onComplete={() => {
                      setHistory(prev => prev.map((e, i) => i === idx ? { ...e, isDone: true } : e));
                    }}
                  />
                )
              ) : null}
            </div>
          ))}

          {isGameActive && (
            <div className="game-container">
              <TerminalSnake onExit={() => {
                setIsGameActive(false);
                setHistory((prev: CommandEntry[]) => [...prev, { 
                  command: '# SNAKE_EXIT', 
                  outputLines: [[{ text: 'SNAKE_PROCESS_TERMINATED. SESSION CLOSED.', colorClass: 'accent-title' }]] 
                }]);
              }} />
            </div>
          )}

          <div ref={bottomRef} style={{ height: '20px' }} />
        </div>
      </div>

      {!isGameActive && (
        <div className="fixed-input-wrapper">
          {shouldShowSuggestions && (
            <div className="suggestions-popover">
              <div className="suggestions-header">Available Commands</div>
              {suggestions.map((s, i) => (
                <div
                  key={s}
                  className={`suggestion-item ${i === selectedIndex ? 'selected' : ''}`}
                  onMouseDown={() => {
                    setInputVal('');
                    setShowSuggestions(false);
                    executeCommand(s);
                  }}
                >
                  {s}
                </div>
              ))}
            </div>
          )}
          <div className="input-line">
            <span className="prompt-symbol-accent">&gt;</span>
            <input
              ref={inputRef}
              type="text"
              value={inputVal}
              onChange={handleChange}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setShowSuggestions(false)}
              onKeyDown={handleKeyPress}
              className="cmd-input retro-input"
              autoFocus
              spellCheck="false"
              autoComplete="off"
              placeholder="Type a command... try &quot;/help&quot;"
            />
          </div>
        </div>
      )}
    </div>
  );
}
