
export function error(msg: string){
  console.error('  [\x1b[31mERROR\x1b[m]: ', msg)
}

export function warning(msg: string){
  console.error('[\x1b[33mWARNING\x1b[m]: ', msg)
}

export function info(msg: string){
  console.error('   [\x1b[34mINFO\x1b[m]: ', msg)
}

export function succeed(msg: string){
  console.error('[\x1b[32mSUCCEED\x1b[m]: ', msg)
}