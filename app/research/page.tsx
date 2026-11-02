import ProSuite from '../../components/ProSuite';
export default async function ResearchPage({searchParams}:{searchParams:Promise<{view?:string}>}){const params=await searchParams;return <ProSuite initialView={params.view==='strategy'?'strategy':params.view==='copilot'?'copilot':'screener'}/>}
