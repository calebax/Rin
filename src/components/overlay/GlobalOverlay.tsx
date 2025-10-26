export default function GlobalOverlay() {
  return (
    <div className="w-full h-full fixed top-0 left-0 z-[9999] pointer-events-auto rounded-[14px] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[rgba(194,188,188,0.3)] to-[rgba(194,188,188,0.3)] backdrop-blur-3xl" />
      <form className="relative w-full h-full rounded-md transition-shadow pointer-events-auto focus-within:ring-[.5px] focus-within:ring-indigo-300/40 bg-neutral-100/50 dark:bg-neutral-800/50 border border-indigo-300/20 shadow-lg shadow-indigo-500/20 flex flex-col">
        <div className="flex-1 p-3 flex flex-col min-h-0">
          <div className="relative flex-1 min-h-[24px]">
            <textarea
              placeholder=""
              className="w-full h-full resize-none rounded-none bg-transparent text-slate-900 dark:text-white focus:outline-none text-base"
            />
          </div>
        </div>

        <div className="dark:border-border flex h-12 items-center justify-between border-t-[0.5px] border-[#c0c0c0] p-3 pl-1.5 flex-shrink-0">
          <div className="flex items-center text-sm gap-4">
            <button
              data-slot="button"
              className="font-medium disabled:pointer-events-none disabled:opacity-50 shrink-0 focus-visible:border-ring aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:hover:bg-accent/50 flex h-9 w-fit cursor-pointer items-center justify-between gap-2 whitespace-nowrap rounded-md bg-transparent px-3 py-2 text-sm text-neutral-700 outline-none transition-all focus-visible:ring-[3px] dark:text-neutral-400"
              data-selected="true"
              type="button"
              aria-haspopup="menu"
              aria-expanded={false}
              data-state="closed"
            >
              <div className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="1em"
                  height="1em"
                  fill="currentColor"
                  viewBox="0 0 256 256"
                  className="size-4 text-current"
                >
                  <path d="M213.85,125.46l-112,120a8,8,0,0,1-13.69-7l14.66-73.33L45.19,143.49a8,8,0,0,1-3-13l112-120a8,8,0,0,1,13.69,7L153.18,90.9l57.63,21.61a8,8,0,0,1,3,12.95Z"></path>
                </svg>
                <span>R</span>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="1em"
                height="1em"
                fill="currentColor"
                viewBox="0 0 256 256"
                className="size-4 text-current opacity-50"
              >
                <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z"></path>
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="rounded-full bg-[#e0e0e0] p-1 text-neutral-400 transition-colors dark:bg-neutral-700"
              data-state="closed"
              data-slot="tooltip-trigger"
              disabled
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={18}
                height={18}
                fill="currentColor"
                viewBox="0 0 256 256"
              >
                <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z"></path>
              </svg>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
