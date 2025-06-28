import { Github, Linkedin, Mail, ExternalLink } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-100 mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Disclaimer Section */}
          <div className="mb-12 p-8 bg-slate-800 rounded-lg border-l-4 border-yellow-500">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center">
                  <span className="text-slate-900 text-sm font-bold">!</span>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-yellow-400 mb-4">
                  Disclaimer
                </h3>
                <div className="space-y-3 text-slate-300 leading-relaxed">
                  <p>
                    <strong className="text-slate-200">Purpose of Use:</strong> This website is created solely for 
                    <span className="text-blue-400 font-medium"> educational, research, and technology demonstration purposes</span>. 
                    We do not encourage commercial use or mass distribution of QR codes.
                  </p>
                  <p>
                    <strong className="text-slate-200">User Responsibility:</strong> Users are 
                    <span className="text-red-400 font-medium"> fully responsible</span> for the content, accuracy, 
                    and legality of QR codes generated from this website.
                  </p>
                  <p>
                    <strong className="text-slate-200">Legal Compliance:</strong> Please ensure that your use of 
                    QR codes complies with local laws and regulations in your jurisdiction. We are not responsible 
                    for any legal consequences arising from misuse.
                  </p>
                  <p className="text-sm text-slate-400 italic">
                    By using this website, you agree to the terms stated above.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Project Info & Author Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Technologies Section */}
            <div>
              <h3 className="text-2xl font-bold text-slate-100 mb-6 flex items-center">
                <span className="mr-3">🚀</span>
                Technologies Used
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-slate-300">Next.js 15</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
                    <span className="text-slate-300">React 19</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                    <span className="text-slate-300">TypeScript</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                    <span className="text-slate-300">Tailwind CSS</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="text-slate-300">Framer Motion</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-slate-300">Recharts</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-slate-300">QR Libraries</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span className="text-slate-300">Lucide Icons</span>
                  </div>
                </div>
              </div>
              
              {/* QR Libraries Detail */}
              <div className="mt-6 p-4 bg-slate-800 rounded-lg">
                <h4 className="text-lg font-semibold text-slate-200 mb-3">QR Code Libraries Compared:</h4>
                <div className="space-y-2 text-sm text-slate-400">
                  <div className="flex items-center justify-between">
                    <span>• qrcode</span>
                    <span className="text-green-400">Server-side generation</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>• react-qr-code</span>
                    <span className="text-blue-400">SVG-based</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>• qrcode.react</span>
                    <span className="text-purple-400">React components</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>• qr-code-styling</span>
                    <span className="text-emerald-400">Advanced styling</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Author Section */}
            <div>
              <h3 className="text-2xl font-bold text-slate-100 mb-6 flex items-center">
                <span className="mr-3">👨‍💻</span>
                About the Author
              </h3>
              
              <div className="bg-gradient-to-br from-slate-800 to-slate-700 p-6 rounded-lg">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    CN
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-100">Canh Nguyen Van</h4>
                    <p className="text-slate-400">Full-Stack Developer</p>
                  </div>
                </div>
                
                <p className="text-slate-300 mb-6 leading-relaxed">
                  Passionate developer interested in performance optimization, modern web technologies, 
                  and creating tools that help developers compare and understand different libraries and frameworks.
                </p>
                
                {/* Social Links */}
                <div className="space-y-3">
                  <a 
                    href="https://github.com/ngvcanh" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center space-x-3 text-slate-300 hover:text-white transition-colors group"
                  >
                    <Github className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span>github.com/ngvcanh</span>
                    <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                  
                  <a 
                    href="https://linkedin.com/in/ngvcanh" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center space-x-3 text-slate-300 hover:text-blue-400 transition-colors group"
                  >
                    <Linkedin className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span>linkedin.com/in/ngvcanh</span>
                    <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                  
                  <a 
                    href="mailto:ngvcanh2014@gmail.com"
                    className="flex items-center space-x-3 text-slate-300 hover:text-green-400 transition-colors group"
                  >
                    <Mail className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span>ngvcanh2014@gmail.com</span>
                  </a>
                </div>
                
                <div className="mt-6 pt-4 border-t border-slate-600">
                  <p className="text-sm text-slate-400 text-center">
                    💡 <span className="text-blue-400 font-medium">Let&apos;s connect and build amazing things together!</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-12 pt-8 border-t border-slate-700 text-center">
            <p className="text-slate-400 text-sm">
              © {new Date().getFullYear()} QR Code Performance Comparison Tool. 
              <span className="mx-2">|</span>
              Built with ❤️ for learning and research purposes.
              <span className="mx-2">|</span>
              <a 
                href="https://github.com/ngvcanh/qrcode-generation" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                View Source Code
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
