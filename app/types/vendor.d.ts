// Type stubs for packages that ship no TypeScript declarations.

declare module "pdfmake/build/pdfmake" {
  const pdfMake: {
    vfs: Record<string, string>;
    addVirtualFileSystem(vfs: Record<string, string>): void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    createPdf(docDefinition: Record<string, any>): {
      download(filename?: string): void;
      open(): void;
      print(): void;
      getDataUrl(cb: (url: string) => void): void;
      getBase64(cb: (data: string) => void): void;
    };
  };
  export default pdfMake;
}

declare module "pdfmake/build/vfs_fonts" {
  const pdfFonts: { pdfMake: { vfs: Record<string, string> } };
  export default pdfFonts;
}

declare module "html-to-pdfmake" {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function htmlToPdfmake(html: string, options?: Record<string, any>): any;
  export default htmlToPdfmake;
}
