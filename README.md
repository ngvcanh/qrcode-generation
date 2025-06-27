# QR Code Generator & Performance Comparison Tool

A comprehensive QR code generation and performance comparison tool built with Next.js. Compare performance metrics across popular QR code libraries: `qrcode`, `react-qr-code`, and `qrcode.react`.

## 🚀 Features

- **Multi-Library Comparison**: Side-by-side comparison of 3 popular QR code libraries
- **Performance Metrics**: Real-time measurement of render time, memory usage, and file size
- **Logo Integration**: Embed custom logos into QR codes
- **Interactive Charts**: Visualize performance data with interactive charts
- **Responsive Design**: Modern, responsive UI with dark mode support
- **Export Options**: Download QR codes and performance data
- **Real-time Analysis**: Dynamic performance analysis and recommendations

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with TypeScript
- **UI**: Tailwind CSS, Framer Motion
- **Charts**: Recharts
- **QR Libraries**: 
  - `qrcode` - Server-side QR code generation
  - `react-qr-code` - React component for QR codes
  - `qrcode.react` - Another React QR code component
- **Icons**: Lucide React
- **Performance**: Built-in performance monitoring

## 🚀 Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📊 Libraries Compared

### 1. `qrcode`
- **Type**: Server-side QR code generation
- **Pros**: Fast, reliable, supports various output formats
- **Use Case**: Backend generation, Node.js applications

### 2. `react-qr-code`
- **Type**: SVG-based React component
- **Pros**: Lightweight, scalable, customizable styling
- **Use Case**: Frontend applications requiring scalable QR codes

### 3. `qrcode.react`
- **Type**: Canvas/SVG React component
- **Pros**: Flexible rendering options, good performance
- **Use Case**: React applications with custom rendering needs

## 📈 Performance Metrics

The tool measures and compares:
- **Render Time**: Time taken to generate QR code
- **Memory Usage**: Memory consumption during generation
- **File Size**: Output file size comparison
- **Logo Integration**: Performance impact of logo embedding

## 🎯 Use Cases

- **Library Selection**: Choose the best QR code library for your project
- **Performance Analysis**: Understand performance characteristics
- **Educational**: Learn about different QR code generation approaches
- **Benchmarking**: Compare libraries under different conditions

## 📝 License

This project is created for educational and research purposes. Please ensure compliance with respective library licenses when using in production.

## 👨‍💻 Author

Created by [Canh Nguyen Van](https://github.com/ngvcanh) - Full Stack Developer passionate about performance optimization and modern web technologies.
