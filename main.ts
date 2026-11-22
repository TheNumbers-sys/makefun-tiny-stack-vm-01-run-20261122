import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

function run(p: Uint8Array, input: Uint8Array) {
  const d = new Int32Array(256), c = new Int32Array(64), m = new Int32Array(256), out = new Uint8Array(65536);
  let sp = 0, cp = 0, pc = 0, ip = 0, len = 0, steps = 0, code = 0;
  const n = p.length;
  for (;;) {
    if (steps === 1000000) { code = 10; break; }
    if (pc < 0 || pc >= n) { code = 9; break; }
    const op = p[pc];
    let imm = 0, pop = 0, push = 0;
    if (op === 1) { imm = 1; push = 1; }
    else if (op === 2) { imm = 4; push = 1; }
    else if (op === 3 || op === 0x17 || op === 0x1b || op === 0x40 || op === 0x50 || op === 0x51 || op === 0x53) pop = 1;
    else if (op === 4 || op === 0x52) { pop = op === 4 ? 1 : 0; push = op === 4 || op === 0x52 ? (op === 4 ? 2 : 1) : 0; }
    else if (op === 5 || op === 6 || op === 7 || (op >= 0x10 && op <= 0x16) || (op >= 0x18 && op <= 0x1a) || (op >= 0x1c && op <= 0x1e) || (op >= 0x20 && op <= 0x22) || op === 0x41) {
      pop = op === 6 ? 2 : op === 7 ? 3 : 2;
      push = op === 5 || op === 7 ? pop : op === 6 ? 3 : op === 0x41 ? 0 : 1;
    } else if (op >= 0x10 && op <= 0x22) { pop = (op === 0x17 || op === 0x1b) ? 1 : 2; push = 1; }
    else if (op === 0x30) imm = 2;
    else if (op === 0x31 || op === 0x32) { imm = 2; pop = 1; }
    else if (op === 0x33) imm = 2;
    else if (op !== 0 && op !== 0x34) { code = 5; break; }
    if (pc + imm >= n) { code = 9; break; }
    steps++;
    const next = pc + 1 + imm;
    if (sp < pop) { code = 2; break; }
    if (sp - pop + push > 256) { code = 3; break; }
    pc = next;
    let a: number, b: number, r: number, s: string;
    switch (op) {
      case 0: return { out: out.slice(0, len), code: 0 };
      case 1: d[sp++] = (p[next - 1] << 24) >> 24; break;
      case 2: d[sp++] = p[next-4] | p[next-3]<<8 | p[next-2]<<16 | p[next-1]<<24; break;
      case 3: sp--; break;
      case 4: d[sp] = d[sp-1]; sp++; break;
      case 5: a=d[sp-1]; d[sp-1]=d[sp-2]; d[sp-2]=a; break;
      case 6: d[sp]=d[sp-2]; sp++; break;
      case 7: a=d[sp-3]; d[sp-3]=d[sp-2]; d[sp-2]=d[sp-1]; d[sp-1]=a; break;
      case 0x17: d[sp-1]=-d[sp-1]|0; break;
      case 0x1b: d[sp-1]=~d[sp-1]; break;
      case 0x10: case 0x11: case 0x12: case 0x13: case 0x14: case 0x15: case 0x16:
      case 0x18: case 0x19: case 0x1a: case 0x1c: case 0x1d: case 0x1e: case 0x20: case 0x21: case 0x22:
        b=d[sp-1]; a=d[sp-2];
        if ((op===0x13 || op===0x14 || op===0x15 || op===0x16) && b===0) { code=4; break; }
        if (op===0x10) r=a+b|0; else if(op===0x11) r=a-b|0; else if(op===0x12) r=Math.imul(a,b);
        else if(op===0x13) r=a===-2147483648&&b===-1?a:(a/b)|0; else if(op===0x14) r=b===-1?0:a%b|0;
        else if(op===0x15) r=Math.floor((a>>>0)/(b>>>0))|0; else if(op===0x16) r=(a>>>0)%(b>>>0)|0;
        else if(op===0x18) r=a&b; else if(op===0x19) r=a|b; else if(op===0x1a) r=a^b;
        else if(op===0x1c) r=a<<(b&31); else if(op===0x1d) r=a>>(b&31); else if(op===0x1e) r=a>>>(b&31);
        else if(op===0x20) r=+(a===b); else if(op===0x21) r=+(a<b); else r=+( (a>>>0)<(b>>>0) );
        sp-=2; d[sp++]=r; break;
      case 0x30: case 0x31: case 0x32:
        r=((p[next-2]|p[next-1]<<8)<<16)>>16;
        if(op===0x30 || (op===0x31 ? d[sp-1]===0 : d[sp-1]!==0)) pc=next+r;
        if(op!==0x30) sp--;
        break;
      case 0x33: if(cp===64){code=7;break;} c[cp++]=next; pc=p[next-2]|p[next-1]<<8; break;
      case 0x34: if(!cp){code=8;break;} pc=c[--cp]; break;
      case 0x40: a=d[sp-1]; if(a<0||a>255){code=6;break;} d[sp-1]=m[a]; break;
      case 0x41: a=d[sp-1]; if(a<0||a>255){code=6;break;} m[a]=d[sp-2]; sp-=2; break;
      case 0x50: s=String(d[sp-1]); if(len+s.length>65536){code=11;break;} sp--; for(let i=0;i<s.length;i++)out[len++]=s.charCodeAt(i); break;
      case 0x51: if(len===65536){code=11;break;} out[len++]=d[--sp]&255; break;
      case 0x52: d[sp++]=ip<input.length?input[ip++]:-1; break;
      case 0x53: return {out:out.slice(0,len),code:d[--sp]&255};
    }
    if (code) break;
  }
  return {out:out.slice(0,len),code};
}

const I=process.env.MAKEFUN_INPUT_DIR??'/input', O=process.env.MAKEFUN_OUTPUT_DIR??'/output';
for(const id of readdirSync(I).sort()) {
  const z=run(new Uint8Array(readFileSync(join(I,id,'program.bin'))),new Uint8Array(readFileSync(join(I,id,'input.bin'))));
  mkdirSync(join(O,id),{recursive:true});
  writeFileSync(join(O,id,'stdout.bin'),z.out); writeFileSync(join(O,id,'exit.txt'),`${z.code}\n`);
}
