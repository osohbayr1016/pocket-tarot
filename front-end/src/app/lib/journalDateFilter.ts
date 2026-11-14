/** Date-range filter uses the viewer's local calendar, not UTC day boundaries. */
export function matchesLocalDateRange(isoTimestamp:string,fromDate="",toDate=""):boolean{
  const date=new Date(isoTimestamp);
  if(!Number.isFinite(date.getTime()))return false;
  const year=String(date.getFullYear()).padStart(4,"0");
  const month=String(date.getMonth()+1).padStart(2,"0");
  const day=String(date.getDate()).padStart(2,"0");
  const localDay=year+"-"+month+"-"+day;
  return (!fromDate||localDay>=fromDate)&&(!toDate||localDay<=toDate);
}
