import {getState} from './db';

async function main() {
  const times = [];
  const start = new Date().getTime();
  for (let i = 0; i < 1; i++) {
    // times.push(getState(1615449242, '64497:1'));
    times.push(getState(1615459177, '64497:1'));
    // times.push(getState(1615449242, '64497:3'));
  }
  // await getState(1615449242, '64497:1');
  await Promise.all(times);
  const end = new Date().getTime();
  console.log((end - start) / 1000, 'seconds');
  // console.log(results);
}

main().then(x => {});
