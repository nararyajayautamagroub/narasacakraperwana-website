import {runScraper,validateScraperConfig} from "../lib/scraper";
const dryRun=process.argv.includes("--dry-run");
async function main(){
  if(dryRun){console.log(JSON.stringify({ok:true,mode:"dry-run",configuration:validateScraperConfig()},null,2));return;}
  const result=await runScraper();console.log(JSON.stringify(result,null,2));
}
main().catch(error=>{console.error(error);process.exit(1)});