/* ============================================================
   QUNVERIO — SARKARI PORTAL HUB (tools/sarkari-portal-hub.js)
   200+ Government Websites — Category-based redirect
   ============================================================ */

console.log('%cSarkari Portal Hub Loading...', 'color:#f59e0b;font-weight:bold');

/* ============================================================
   TOOL REGISTRATION (setup.js mein automatically add hoga)
   ============================================================ */
(function registerSarkariPortalHub() {
  if (!window.EXTRA_TOOLS) {
    console.warn('[SPH] setup.js not loaded yet, retrying...');
    setTimeout(registerSarkariPortalHub, 100);
    return;
  }

  // Already registered? Skip
  if (window.EXTRA_TOOLS.find(t => t.id === 'sarkari-portal-hub')) {
    console.log('%c[SPH] Already registered ✅', 'color:#10b981');
    return;
  }

  // Register tool
  window.EXTRA_TOOLS.push({
    id: 'sarkari-portal-hub',
    name: 'Sarkari Portal Hub',
    cat: 'sarkari',
    icon: '🇮🇳',
    desc: '200+ government websites in one place — Aadhaar, PAN, VAHAN, Land Records & more',
    howto: 'Search box mein type karo (jaise "aadhaar" ya "vahan"). Category chip select karo. Card pe click karo — official website new tab mein khulegi.',
    kw: ['sarkari', 'government', 'aadhaar', 'pan', 'vahan', 'land', 'bhulekh', 'gst', 'itr', 'epfo', 'passport', 'voter', 'ration', 'yojana', 'pm kisan', 'gov', 'govt', 'india']
  });

  console.log('%c[SPH] Tool registered ✅', 'color:#10b981;font-weight:bold');
})();

/* ============================================================
   200+ GOVERNMENT WEBSITES DATA
   ============================================================ */
window.QVR_SPH_DATA = { categories: [
{ id:"identity", icon:"🆔", name:"Identity Documents", portals:[
{ name:"Aadhaar Download", url:"https://myaadhaar.uidai.gov.in/", tags:"aadhaar download uidai" },
{ name:"Aadhaar Update (SSUP)", url:"https://ssup.uidai.gov.in/", tags:"aadhaar update correction" },
{ name:"Aadhaar PVC Order", url:"https://myaadhaar.uidai.gov.in/", tags:"aadhaar pvc card" },
{ name:"Aadhaar Link Mobile", url:"https://myaadhaar.uidai.gov.in/", tags:"aadhaar mobile link" },
{ name:"UIDAI Main", url:"https://uidai.gov.in/", tags:"uidai aadhaar" },
{ name:"PAN Card (NSDL)", url:"https://onlineservices.nsdl.com/", tags:"pan nsdl tax" },
{ name:"PAN Card (UTIITSL)", url:"https://pan.utiitsl.com/", tags:"pan uti" },
{ name:"PAN-Aadhaar Link", url:"https://www.incometax.gov.in/", tags:"pan aadhaar link" },
{ name:"Voter ID Services", url:"https://voters.eci.gov.in/", tags:"voter election eci" },
{ name:"Voter Registration", url:"https://voters.eci.gov.in/", tags:"voter register new" },
{ name:"Passport Seva", url:"https://www.passportindia.gov.in/", tags:"passport travel" },
{ name:"Passport Appointment", url:"https://www.passportindia.gov.in/", tags:"passport appointment" },
{ name:"Driving Licence (Sarathi)", url:"https://sarathi.parivahan.gov.in/", tags:"licence dl driving" },
{ name:"Learning Licence", url:"https://sarathi.parivahan.gov.in/", tags:"ll learning licence" },
{ name:"Birth Certificate", url:"https://crsorgi.gov.in/", tags:"birth certificate" },
{ name:"Death Certificate", url:"https://crsorgi.gov.in/", tags:"death certificate" },
{ name:"DigiLocker", url:"https://www.digilocker.gov.in/", tags:"digilocker documents" },
{ name:"e-Sign", url:"https://www.esign.gov.in/", tags:"esign digital signature" },
{ name:"Ration Card (NFSA)", url:"https://nfsa.gov.in/", tags:"ration card nfsa" },
{ name:"Marriage Certificate", url:"https://crsorgi.gov.in/", tags:"marriage certificate" }
]},

{ id:"vehicle", icon:"🚗", name:"Vehicle & Transport", portals:[
{ name:"VAHAN (RC Details)", url:"https://vahan.parivahan.gov.in/", tags:"vahan rc vehicle" },
{ name:"VAHAN Citizen", url:"https://vahan.parivahan.gov.in/vahan4dashboard/", tags:"vahan citizen" },
{ name:"eChallan Check", url:"https://echallan.parivahan.gov.in/", tags:"challan fine traffic" },
{ name:"FASTag (NETC)", url:"https://netc.org.in/", tags:"fastag toll netc" },
{ name:"Insurance (IIB)", url:"https://www.iib.gov.in/", tags:"insurance vehicle" },
{ name:"PUC Certificate", url:"https://puc.parivahan.gov.in/", tags:"puc pollution" },
{ name:"Parivahan Main", url:"https://parivahan.gov.in/", tags:"parivahan transport" },
{ name:"RTO Office Info", url:"https://parivahan.gov.in/rto/", tags:"rto office" },
{ name:"Sarathi DL", url:"https://sarathi.parivahan.gov.in/", tags:"sarathi dl" },
{ name:"Vehicle Registration", url:"https://vahan.parivahan.gov.in/", tags:"vehicle registration" },
{ name:"NHAI", url:"https://nhai.gov.in/", tags:"nhai highway" },
{ name:"IRCTC", url:"https://www.irctc.co.in/", tags:"irctc train" },
{ name:"Indian Railways", url:"https://indianrailways.gov.in/", tags:"railway train" },
{ name:"Rail Madad", url:"https://railmadad.indianrailways.gov.in/", tags:"rail madad complaint" },
{ name:"DGCA", url:"https://www.dgca.gov.in/", tags:"dgca aviation" },
{ name:"AAI", url:"https://www.aai.aero/", tags:"aai airport" },
{ name:"State Transport MP", url:"https://www.mptransport.org/", tags:"mp transport" },
{ name:"State Transport UP", url:"https://upsrtc.up.gov.in/", tags:"up transport" },
{ name:"State Transport Gujarat", url:"https://www.gsrtc.in/", tags:"gujarat transport" },
{ name:"State Transport Rajasthan", url:"https://rsrtc.rajasthan.gov.in/", tags:"rajasthan transport" },
{ name:"State Transport Maharashtra", url:"https://www.msrtc.gov.in/", tags:"maharashtra transport" }
]},

{ id:"land", icon:"🏞️", name:"Land & Property", portals:[
{ name:"MP Bhu-Lekh", url:"https://mpbhulekh.gov.in/", tags:"mp bhulekh khasra" },
{ name:"MP Bhu-Naksha", url:"https://mpbhunaksha.gov.in/", tags:"mp map naksha" },
{ name:"MP Sampada", url:"https://sampada.mp.gov.in/", tags:"mp sampada" },
{ name:"AnyROR Gujarat", url:"https://anyror.gujarat.gov.in/", tags:"gujarat ror 7/12" },
{ name:"Gujarat Garvi", url:"https://garvi.gujarat.gov.in/", tags:"gujarat garvi land" },
{ name:"Apna Khata Rajasthan", url:"https://apnakhata.rajasthan.gov.in/", tags:"rajasthan jamabandi" },
{ name:"Rajasthan Land Map", url:"https://landmap.rajasthan.gov.in/", tags:"rajasthan map" },
{ name:"UP Bhulekh", url:"https://upbhulekh.gov.in/", tags:"up khatauni" },
{ name:"UP Bhu-Naksha", url:"https://upbhunaksha.up.nic.in/", tags:"up map" },
{ name:"Mahabhulekh", url:"https://mahabhulekh.maharashtra.gov.in/", tags:"maharashtra 7/12" },
{ name:"Mahabhunakasha", url:"https://mahabhunakasha.mahabhumi.gov.in/", tags:"maharashtra map" },
{ name:"Bihar Bhumi", url:"https://biharbhumi.bihar.gov.in/", tags:"bihar jamabandi" },
{ name:"Bihar Bhu-Naksha", url:"https://bhunaksha.bihar.gov.in/", tags:"bihar map" },
{ name:"DILRMP National", url:"https://dilrmp.gov.in/", tags:"land national" },
{ name:"RERA", url:"https://rera.gov.in/", tags:"rera real estate" },
{ name:"Karnataka Bhoomi", url:"https://landrecords.karnataka.gov.in/", tags:"karnataka bhoomi" },
{ name:"Tamil Nadu e-Services", url:"https://eservices.tn.gov.in/", tags:"tn land" },
{ name:"Telangana Dharani", url:"https://dharani.telangana.gov.in/", tags:"telangana dharani" },
{ name:"AP Bhu-Naksha", url:"https://bhunaksha.ap.gov.in/", tags:"ap land" },
{ name:"Kerala ReLIS", url:"https://revenue.kerala.gov.in/", tags:"kerala land" },
{ name:"West Bengal Banglarbhumi", url:"https://banglarbhumi.gov.in/", tags:"wb land" },
{ name:"Punjab Jamabandi", url:"https://jamabandi.punjab.gov.in/", tags:"punjab land" },
{ name:"Haryana Jamabandi", url:"https://jamabandi.nic.in/", tags:"haryana land" },
{ name:"Odisha Bhulekh", url:"https://bhulekh.ori.nic.in/", tags:"odisha land" },
{ name:"Jharkhand Jharbhoomi", url:"https://jharbhoomi.jharkhand.gov.in/", tags:"jharkhand land" },
{ name:"Chhattisgarh Bhu-Naksha", url:"https://bhu-naksha.cg.nic.in/", tags:"chhattisgarh land" },
{ name:"Uttarakhand Devbhoomi", url:"https://devbhoomiservices.uk.gov.in/", tags:"uttarakhand land" },
{ name:"Assam Dharitree", url:"https://dharitree.assam.gov.in/", tags:"assam land" },
{ name:"Delhi Land Records", url:"https://dlrc.delhi.gov.in/", tags:"delhi land" }
]},

{ id:"tax", icon:"💰", name:"Tax & Finance", portals:[
{ name:"Income Tax (ITR)", url:"https://www.incometax.gov.in/", tags:"itr tax income" },
{ name:"e-Filing ITR", url:"https://www.incometax.gov.in/iec/foportal/", tags:"itr efiling" },
{ name:"GST Portal", url:"https://www.gst.gov.in/", tags:"gst tax business" },
{ name:"GST Return", url:"https://www.gst.gov.in/", tags:"gstr gst return" },
{ name:"TRACES (TDS)", url:"https://www.tdscpc.gov.in/", tags:"tds traces" },
{ name:"EPFO (PF)", url:"https://www.epfindia.gov.in/", tags:"pf epfo pension" },
{ name:"UAN Member Portal", url:"https://unifiedportal-mem.epfindia.gov.in/", tags:"uan pf" },
{ name:"EPFO Passbook", url:"https://passbook.epfindia.gov.in/", tags:"epfo passbook" },
{ name:"ESIC", url:"https://www.esic.gov.in/", tags:"esic insurance" },
{ name:"RBI UDGAM", url:"https://udgam.rbi.org.in/", tags:"unclaimed deposit rbi" },
{ name:"NPS Trust", url:"https://npstrust.org.in/", tags:"nps pension" },
{ name:"NPS Calculator", url:"https://npstrust.org.in/", tags:"nps calculator" },
{ name:"PPF", url:"https://www.indiapost.gov.in/", tags:"ppf post" },
{ name:"Sukanya Samriddhi", url:"https://www.indiapost.gov.in/", tags:"sukanya ssy" },
{ name:"Senior Citizen Savings", url:"https://www.indiapost.gov.in/", tags:"scss senior" },
{ name:"Kisan Vikas Patra", url:"https://www.indiapost.gov.in/", tags:"kvp post" },
{ name:"NSC", url:"https://www.indiapost.gov.in/", tags:"nsc post" }
]},

{ id:"banking", icon:"🏦", name:"Banking & Insurance", portals:[
{ name:"RBI", url:"https://www.rbi.org.in/", tags:"rbi bank" },
{ name:"SEBI", url:"https://www.sebi.gov.in/", tags:"sebi stock" },
{ name:"IRDAI", url:"https://irdai.gov.in/", tags:"insurance irdai" },
{ name:"PM Jan Dhan Yojana", url:"https://pmjdy.gov.in/", tags:"jan dhan bank" },
{ name:"Jansuraksha", url:"https://www.jansuraksha.gov.in/", tags:"insurance pmjjby" },
{ name:"PMJJBY", url:"https://www.jansuraksha.gov.in/", tags:"pmjjby life" },
{ name:"PMSBY", url:"https://www.jansuraksha.gov.in/", tags:"pmsby accident" },
{ name:"Atal Pension Yojana", url:"https://www.npscra.nsdl.co.in/", tags:"apy pension" },
{ name:"NPCI", url:"https://www.npci.org.in/", tags:"npci upi" },
{ name:"UPI", url:"https://www.npci.org.in/", tags:"upi payment" },
{ name:"NEFT/RTGS", url:"https://www.rbi.org.in/", tags:"neft rtgs" },
{ name:"DICGC", url:"https://www.dicgc.org.in/", tags:"dicgc deposit" },
{ name:"NABARD", url:"https://www.nabard.org/", tags:"nabard rural" },
{ name:"SIDBI", url:"https://www.sidbi.in/", tags:"sidbi msme" },
{ name:"MUDRA", url:"https://www.mudra.org.in/", tags:"mudra loan" },
{ name:"Stand Up India", url:"https://www.standupmitra.in/", tags:"standup loan" }
]},

{ id:"education", icon:"🎓", name:"Education", portals:[
{ name:"National Scholarship Portal", url:"https://scholarships.gov.in/", tags:"scholarship student" },
{ name:"CBSE", url:"https://www.cbse.gov.in/", tags:"cbse board" },
{ name:"CBSE Results", url:"https://results.cbse.nic.in/", tags:"cbse result" },
{ name:"UGC", url:"https://www.ugc.gov.in/", tags:"ugc university" },
{ name:"AICTE", url:"https://www.aicte-india.org/", tags:"aicte college" },
{ name:"NTA (Exams)", url:"https://nta.ac.in/", tags:"nta jee neet" },
{ name:"JEE Main", url:"https://jeemain.nta.nic.in/", tags:"jee engineering" },
{ name:"NEET", url:"https://neet.nta.nic.in/", tags:"neet medical" },
{ name:"UGC NET", url:"https://ugcnet.nta.nic.in/", tags:"net ugc" },
{ name:"e-Pathshala", url:"https://epathshala.nic.in/", tags:"study school" },
{ name:"SWAYAM", url:"https://swayam.gov.in/", tags:"online course" },
{ name:"NPTEL", url:"https://nptel.ac.in/", tags:"nptel engineering" },
{ name:"NCERT", url:"https://ncert.nic.in/", tags:"ncert books" },
{ name:"IGNOU", url:"https://ignou.ac.in/", tags:"ignou distance" },
{ name:"NIOS", url:"https://www.nios.ac.in/", tags:"nios open school" },
{ name:"MP Board", url:"https://mpbse.nic.in/", tags:"mpbse mp board" },
{ name:"UP Board", url:"https://upmsp.edu.in/", tags:"upmsp up board" },
{ name:"Gujarat Board", url:"https://www.gseb.org/", tags:"gseb gujarat" },
{ name:"Rajasthan Board", url:"https://rajeduboard.rajasthan.gov.in/", tags:"rbse rajasthan" },
{ name:"Maharashtra Board", url:"https://mahahsscboard.in/", tags:"maharashtra board" },
{ name:"Bihar Board", url:"https://biharboardonline.bihar.gov.in/", tags:"bseb bihar" }
]},

{ id:"health", icon:"🏥", name:"Health", portals:[
{ name:"Ayushman Bharat (PM-JAY)", url:"https://pmjay.gov.in/", tags:"ayushman health" },
{ name:"CoWIN", url:"https://www.cowin.gov.in/", tags:"covid vaccine" },
{ name:"ABHA Health ID", url:"https://abha.abdm.gov.in/", tags:"abha health id" },
{ name:"National Health Portal", url:"https://www.nhp.gov.in/", tags:"health" },
{ name:"ICMR", url:"https://www.icmr.gov.in/", tags:"icmr research" },
{ name:"MoHFW", url:"https://www.mohfw.gov.in/", tags:"health ministry" },
{ name:"AIIMS Delhi", url:"https://www.aiims.edu/", tags:"aiims delhi" },
{ name:"eSanjeevani", url:"https://esanjeevani.mohfw.gov.in/", tags:"telemedicine online" },
{ name:"ABDM Digital Health", url:"https://abdm.gov.in/", tags:"abdm digital health" },
{ name:"Blood Bank (eRaktKosh)", url:"https://eraktkosh.mohfw.gov.in/", tags:"blood bank" }
]},

{ id:"agriculture", icon:"🌾", name:"Agriculture", portals:[
{ name:"PM-Kisan", url:"https://pmkisan.gov.in/", tags:"kisan farmer subsidy" },
{ name:"PM-Kisan Beneficiary", url:"https://pmkisan.gov.in/", tags:"kisan beneficiary status" },
{ name:"eNAM (Mandi)", url:"https://enam.gov.in/", tags:"mandi crop" },
{ name:"Agmarknet", url:"https://agmarknet.gov.in/", tags:"mandi price" },
{ name:"mKisan", url:"https://mkisan.gov.in/", tags:"kisan advisory" },
{ name:"PM Fasal Bima", url:"https://pmfby.gov.in/", tags:"bima crop insurance" },
{ name:"Kisan Credit Card", url:"https://www.nabard.org/", tags:"kcc loan" },
{ name:"Soil Health Card", url:"https://soilhealth.dac.gov.in/", tags:"soil health" },
{ name:"Agriculture Ministry", url:"https://agriwelfare.gov.in/", tags:"agriculture ministry" },
{ name:"ICAR", url:"https://icar.org.in/", tags:"icar research" },
{ name:"Kisan Call Center", url:"https://mkisan.gov.in/", tags:"kisan call" },
{ name:"PM Krishi Sinchai", url:"https://pmksy.gov.in/", tags:"irrigation sinchai" },
{ name:"Dairy (NDDB)", url:"https://www.nddb.coop/", tags:"dairy milk" },
{ name:"Fisheries (NFDB)", url:"https://nfdb.gov.in/", tags:"fisheries fish" },
{ name:"Animal Husbandry", url:"https://dahd.gov.in/", tags:"animal husbandry" }
]},

{ id:"employment", icon:"👷", name:"Employment & Labour", portals:[
{ name:"NCS (Job Portal)", url:"https://www.ncs.gov.in/", tags:"job ncs employment" },
{ name:"eShram", url:"https://eshram.gov.in/", tags:"eshram worker" },
{ name:"Shram Suvidha", url:"https://shramsuvidha.gov.in/", tags:"labour compliance" },
{ name:"PM SVANidhi", url:"https://pmsvanidhi.mohua.gov.in/", tags:"street vendor loan" },
{ name:"MGNREGA", url:"https://nrega.nic.in/", tags:"mgnrega rural job" },
{ name:"MGNREGA Job Card", url:"https://nrega.nic.in/", tags:"job card nrega" },
{ name:"Labour Ministry", url:"https://labour.gov.in/", tags:"labour ministry" },
{ name:"Apprenticeship (NAPS)", url:"https://www.apprenticeshipindia.gov.in/", tags:"apprentice training" },
{ name:"Skill India (NSDC)", url:"https://www.nsdcindia.org/", tags:"skill training" },
{ name:"PMKVY", url:"https://www.pmkvyofficial.org/", tags:"pmkvy skill" },
{ name:"DDU-GKY", url:"https://ddugky.gov.in/", tags:"ddugky rural skill" }
]},

{ id:"housing", icon:"🏠", name:"Housing & Utility", portals:[
{ name:"PM Awas Yojana (Urban)", url:"https://pmaymis.gov.in/", tags:"awas house pmay urban" },
{ name:"PM Awas Yojana (Rural)", url:"https://pmayg.nic.in/", tags:"awas rural" },
{ name:"Ujjwala (LPG)", url:"https://www.pmuy.gov.in/", tags:"lpg ujjwala" },
{ name:"Saubhagya", url:"https://saubhagya.gov.in/", tags:"electricity" },
{ name:"Jal Jeevan Mission", url:"https://jaljeevanmission.gov.in/", tags:"water jal" },
{ name:"Swachh Bharat", url:"https://swachhbharatmission.gov.in/", tags:"swachh cleanliness" },
{ name:"Smart Cities", url:"https://smartcities.gov.in/", tags:"smart city" },
{ name:"AMRUT", url:"https://amrut.gov.in/", tags:"amrut urban" },
{ name:"DAY-NULM", url:"https://nulm.gov.in/", tags:"nulm urban livelihood" }
]},

{ id:"grievance", icon:"📢", name:"Complaints & Grievance", portals:[
{ name:"CPGRAMS (PG Portal)", url:"https://pgportal.gov.in/", tags:"complaint grievance" },
{ name:"Cyber Crime", url:"https://cybercrime.gov.in/", tags:"cyber crime" },
{ name:"Consumer Helpline", url:"https://consumerhelpline.gov.in/", tags:"consumer complaint" },
{ name:"RTI Online", url:"https://rtionline.gov.in/", tags:"rti info" },
{ name:"MyGov", url:"https://www.mygov.in/", tags:"mygov feedback" },
{ name:"Women Helpline", url:"https://www.wcd.nic.in/", tags:"women helpline" },
{ name:"Child Helpline", url:"https://www.wcd.nic.in/", tags:"child helpline" },
{ name:"Anti-Corruption (CVC)", url:"https://cvc.gov.in/", tags:"cvc corruption" },
{ name:"Lokpal", url:"https://lokpal.gov.in/", tags:"lokpal" },
{ name:"NHRC", url:"https://nhrc.nic.in/", tags:"nhrc human rights" }
]},

{ id:"civic", icon:"🗳️", name:"Election & Civic", portals:[
{ name:"Election Commission", url:"https://eci.gov.in/", tags:"election eci" },
{ name:"Voter Services", url:"https://voters.eci.gov.in/", tags:"voter register" },
{ name:"Census India", url:"https://censusindia.gov.in/", tags:"census population" },
{ name:"India Post", url:"https://www.indiapost.gov.in/", tags:"post courier" },
{ name:"MEA (Foreign)", url:"https://www.mea.gov.in/", tags:"mea foreign" },
{ name:"eMigrate", url:"https://emigrate.gov.in/", tags:"emigrate worker" },
{ name:"Madad (MEA)", url:"https://madad.gov.in/", tags:"madad nri" },
{ name:"Municipal Corp Delhi", url:"https://mcdonline.nic.in/", tags:"mcd delhi" },
{ name:"BMC Mumbai", url:"https://portal.mcgm.gov.in/", tags:"bmc mumbai" },
{ name:"BBMP Bangalore", url:"https://bbmp.gov.in/", tags:"bbmp bangalore" }
]},

{ id:"business", icon:"💼", name:"Business & Startup", portals:[
{ name:"MCA (Company)", url:"https://www.mca.gov.in/", tags:"mca company" },
{ name:"Startup India", url:"https://www.startupindia.gov.in/", tags:"startup" },
{ name:"MSME (Udyam)", url:"https://udyamregistration.gov.in/", tags:"msme udyam" },
{ name:"GeM (Govt eMarket)", url:"https://gem.gov.in/", tags:"gem government market" },
{ name:"DGFT (Import/Export)", url:"https://www.dgft.gov.in/", tags:"dgft import export" },
{ name:"IEC (Import Export Code)", url:"https://www.dgft.gov.in/", tags:"iec code" },
{ name:"FSSAI (Food)", url:"https://www.foscos.fssai.gov.in/", tags:"fssai food license" },
{ name:"Trademark (IP India)", url:"https://ipindia.gov.in/", tags:"trademark ip" },
{ name:"Patent (IP India)", url:"https://ipindia.gov.in/", tags:"patent ip" },
{ name:"Copyright", url:"https://copyright.gov.in/", tags:"copyright" },
{ name:"GST Registration", url:"https://www.gst.gov.in/", tags:"gst registration" },
{ name:"MSME Ministry", url:"https://msme.gov.in/", tags:"msme ministry" },
{ name:"NSIC", url:"https://www.nsic.co.in/", tags:"nsic msme" },
{ name:"Khadi (KVIC)", url:"https://www.kvic.gov.in/", tags:"khadi kvic" }
]},

{ id:"travel", icon:"✈️", name:"Travel & Tourism", portals:[
{ name:"Incredible India", url:"https://www.incredibleindia.org/", tags:"india tourism" },
{ name:"Tourism Ministry", url:"https://tourism.gov.in/", tags:"tourism ministry" },
{ name:"IRCTC", url:"https://www.irctc.co.in/", tags:"irctc train" },
{ name:"Rail Madad", url:"https://railmadad.indianrailways.gov.in/", tags:"rail complaint" },
{ name:"Indian Railways", url:"https://indianrailways.gov.in/", tags:"railways" },
{ name:"PNR Status", url:"https://www.indianrail.gov.in/", tags:"pnr status" },
{ name:"DGCA", url:"https://www.dgca.gov.in/", tags:"dgca" },
{ name:"AAI", url:"https://www.aai.aero/", tags:"aai airport" },
{ name:"Visa on Arrival", url:"https://indianvisaonline.gov.in/", tags:"visa" },
{ name:"ASI (Monuments)", url:"https://asi.nic.in/", tags:"asi monuments" },
{ name:"e-Visa", url:"https://indianvisaonline.gov.in/", tags:"evisa" },
{ name:"Bureau of Immigration", url:"https://boi.gov.in/", tags:"immigration" }
]},

{ id:"utility", icon:"📄", name:"Utility Services", portals:[
{ name:"UMANG", url:"https://web.umang.gov.in/", tags:"umang all services" },
{ name:"e-District", url:"https://edistrict.gov.in/", tags:"edistrict" },
{ name:"Common Service Centre", url:"https://csc.gov.in/", tags:"csc" },
{ name:"e-Office", url:"https://eoffice.gov.in/", tags:"eoffice" },
{ name:"NIC", url:"https://www.nic.in/", tags:"nic" },
{ name:"India.gov.in", url:"https://www.india.gov.in/", tags:"india gov" },
{ name:"Data.gov.in", url:"https://data.gov.in/", tags:"data gov open" },
{ name:"NIC e-Services", url:"https://services.nic.in/", tags:"nic eservices" },
{ name:"National Portal", url:"https://www.india.gov.in/", tags:"national portal" }
]}

]};

/* ============================================================
   RENDERER — Tool ka body HTML
   ============================================================ */
window.EXTRA_TOOL_RENDERERS['sarkari-portal-hub'] = function() {
  const data = window.QVR_SPH_DATA;
  let total = 0;
  data.categories.forEach(c => total += c.portals.length);

  return `
    <style>
      .qvr-sph{max-width:1000px;margin:0 auto;padding:0}
      .qvr-sph-hero{text-align:center;padding:24px 16px 18px;background:linear-gradient(135deg,var(--surface) 0%,var(--surface-2) 100%);border-radius:16px;margin-bottom:16px;border:1px solid var(--border)}
      .qvr-sph-flag{font-size:40px;margin-bottom:6px;display:inline-block;animation:qvrWave 3s ease-in-out infinite}
      @keyframes qvrWave{0%,100%{transform:rotate(0)}25%{transform:rotate(-8deg)}75%{transform:rotate(8deg)}}
      .qvr-sph-title{font-size:22px;font-weight:800;margin-bottom:6px;background:linear-gradient(90deg,#ff9933,#fff,#138808);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
      .qvr-sph-sub{color:var(--text-3);font-size:13.5px;margin-bottom:8px}
      .qvr-sph-count{display:inline-block;padding:4px 12px;background:rgba(124,58,237,.15);border:1px solid rgba(124,58,237,.3);border-radius:999px;font-size:12px;color:#c4b5fd;font-weight:600}

      .qvr-sph-searchwrap{position:relative;margin-bottom:12px}
      .qvr-sph-searchicon{position:absolute;left:14px;top:50%;transform:translateY(-50%);font-size:16px;pointer-events:none;opacity:.6}
      .qvr-sph-search{width:100%;padding:14px 16px 14px 42px;border-radius:12px;border:1.5px solid var(--border-strong);background:var(--surface-2);color:var(--text);font-size:14.5px;font-family:inherit;outline:none;transition:.2s}
      .qvr-sph-search:focus{border-color:var(--primary);box-shadow:0 0 0 3px rgba(99,102,241,.15)}

      .qvr-sph-quick{display:flex;gap:6px;overflow-x:auto;padding-bottom:6px;margin-bottom:12px;scrollbar-width:none}
      .qvr-sph-quick::-webkit-scrollbar{display:none}
      .qvr-sph-quickbtn{flex-shrink:0;padding:7px 13px;border-radius:999px;border:1px solid var(--border-strong);background:var(--surface-2);color:var(--text-2);font-size:12.5px;font-weight:600;cursor:pointer;white-space:nowrap;transition:.2s}
      .qvr-sph-quickbtn:hover{background:var(--gradient);color:#fff;border-color:transparent}

      .qvr-sph-cats{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px}
      .qvr-sph-cat-chip{padding:6px 12px;border-radius:999px;border:1px solid var(--border);background:var(--surface-2);color:var(--text-3);font-size:12px;font-weight:600;cursor:pointer;transition:.2s}
      .qvr-sph-cat-chip:hover,.qvr-sph-cat-chip.active{background:rgba(99,102,241,.18);color:#c4b5fd;border-color:rgba(99,102,241,.4)}

      .qvr-sph-list{display:flex;flex-direction:column;gap:20px}
      .qvr-sph-section{animation:qvrFade .3s ease}
      @keyframes qvrFade{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
      .qvr-sph-sectionhead{display:flex;align-items:center;gap:8px;margin-bottom:10px}
      .qvr-sph-sectionicon{font-size:18px}
      .qvr-sph-sectiontitle{font-size:15px;font-weight:700;color:var(--text);margin:0}
      .qvr-sph-sectioncount{font-size:11px;color:var(--text-3);background:var(--surface-2);padding:2px 7px;border-radius:999px}
      .qvr-sph-cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:8px}
      .qvr-sph-card{display:flex;align-items:center;gap:10px;padding:12px 14px;border-radius:11px;background:var(--surface-2);border:1px solid var(--border);text-decoration:none;color:var(--text);transition:.2s;position:relative;overflow:hidden}
      .qvr-sph-card::before{content:'';position:absolute;left:0;top:0;bottom:0;width:3px;background:var(--gradient);opacity:0;transition:.2s}
      .qvr-sph-card:hover{border-color:var(--border-strong);transform:translateY(-1px);box-shadow:var(--shadow-md)}
      .qvr-sph-card:hover::before{opacity:1}
      .qvr-sph-cardicon{width:22px;height:22px;flex-shrink:0;border-radius:4px}
      .qvr-sph-cardbody{flex:1;min-width:0}
      .qvr-sph-cardname{font-size:13.5px;font-weight:600;margin:0 0 2px;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .qvr-sph-cardurl{font-size:11px;color:var(--text-3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin:0}
      .qvr-sph-cardarrow{color:var(--text-3);font-size:13px;transition:.2s}
      .qvr-sph-card:hover .qvr-sph-cardarrow{color:#a78bfa;transform:translateX(2px)}

      .qvr-sph-empty{text-align:center;padding:40px 20px;color:var(--text-3)}
      .qvr-sph-emptyicon{font-size:32px;margin-bottom:8px;opacity:.5}

      @media(max-width:560px){.qvr-sph-title{font-size:18px}.qvr-sph-cards{grid-template-columns:1fr}}
    </style>

    <div class="qvr-sph">
      <div class="qvr-sph-hero">
        <div class="qvr-sph-flag">🇮🇳</div>
        <h2 class="qvr-sph-title">Sarkari Portal Hub</h2>
        <p class="qvr-sph-sub">All official government websites — in one place</p>
        <div class="qvr-sph-count">${total}+ Portals</div>
      </div>

      <div class="qvr-sph-searchwrap">
        <span class="qvr-sph-searchicon">🔍</span>
        <input id="qvrSphSearch" class="qvr-sph-search" type="text" placeholder="Search: aadhaar, pan, vahan, land record..." autocomplete="off" />
      </div>

      <div class="qvr-sph-quick">
        <button class="qvr-sph-quickbtn" data-jump="identity">🆔 Aadhaar/PAN</button>
        <button class="qvr-sph-quickbtn" data-jump="vehicle">🚗 Vehicle</button>
        <button class="qvr-sph-quickbtn" data-jump="land">🏞️ Land</button>
        <button class="qvr-sph-quickbtn" data-jump="tax">💰 Tax/PF</button>
        <button class="qvr-sph-quickbtn" data-jump="health">🏥 Health</button>
        <button class="qvr-sph-quickbtn" data-jump="agriculture">🌾 Kisan</button>
      </div>

      <div id="qvrSphCategories" class="qvr-sph-cats"></div>
      <div id="qvrSphList" class="qvr-sph-list"></div>

      <div id="qvrSphEmpty" class="qvr-sph-empty" style="display:none">
        <div class="qvr-sph-emptyicon">🔍</div>
        <p>No portal found. Try "aadhaar", "pan", "vahan".</p>
      </div>
    </div>
  `;
};

/* ============================================================
   INIT — Tool render hone ke baad ye chalega
   ============================================================ */
window.EXTRA_TOOL_INITS['sarkari-portal-hub'] = function() {
  const data = window.QVR_SPH_DATA;
  let activeCategory = null;
  let searchQuery = '';

  const catsEl = document.getElementById('qvrSphCategories');
  const listEl = document.getElementById('qvrSphList');
  const emptyEl = document.getElementById('qvrSphEmpty');
  const searchEl = document.getElementById('qvrSphSearch');

  if (!catsEl || !listEl) {
    console.warn('[SPH] Elements not found');
    return;
  }

  function favicon(url) {
    try {
      const d = new URL(url).hostname;
      return 'https://www.google.com/s2/favicons?domain=' + d + '&sz=64';
    } catch (e) { return ''; }
  }

  function renderCategories() {
    let html = '<button class="qvr-sph-cat-chip ' + (activeCategory ? '' : 'active') + '" data-cat="">📚 All</button>';
    data.categories.forEach(function (cat) {
      html += '<button class="qvr-sph-cat-chip ' + (activeCategory === cat.id ? 'active' : '') + '" data-cat="' + cat.id + '">' + cat.icon + ' ' + cat.name + '</button>';
    });
    catsEl.innerHTML = html;
    catsEl.querySelectorAll('.qvr-sph-cat-chip').forEach(function (btn) {
      btn.addEventListener('click', function () {
        activeCategory = btn.dataset.cat || null;
        renderCategories();
        renderList();
      });
    });
  }

  function renderList() {
    const q = searchQuery.trim().toLowerCase();
    let total = 0;
    let html = '';

    data.categories.forEach(function (cat) {
      if (activeCategory && cat.id !== activeCategory) return;
      const matched = cat.portals.filter(function (p) {
        if (!q) return true;
        return p.name.toLowerCase().indexOf(q) > -1 ||
               p.tags.toLowerCase().indexOf(q) > -1 ||
               cat.name.toLowerCase().indexOf(q) > -1;
      });
      if (!matched.length) return;
      total += matched.length;
      html += '<section class="qvr-sph-section" id="qvr-cat-' + cat.id + '">' +
              '<div class="qvr-sph-sectionhead">' +
              '<span class="qvr-sph-sectionicon">' + cat.icon + '</span>' +
              '<h3 class="qvr-sph-sectiontitle">' + cat.name + '</h3>' +
              '<span class="qvr-sph-sectioncount">' + matched.length + '</span>' +
              '</div><div class="qvr-sph-cards">';
      matched.forEach(function (p) {
        let host = '';
        try { host = new URL(p.url).hostname; } catch (e) {}
        html += '<a class="qvr-sph-card" href="' + p.url + '" target="_blank" rel="noopener noreferrer">' +
                '<img class="qvr-sph-cardicon" src="' + favicon(p.url) + '" alt="" onerror="this.style.display=\'none\'">' +
                '<div class="qvr-sph-cardbody">' +
                '<p class="qvr-sph-cardname">' + p.name + '</p>' +
                '<p class="qvr-sph-cardurl">' + host + '</p>' +
                '</div><span class="qvr-sph-cardarrow">↗</span></a>';
      });
      html += '</div></section>';
    });

    if (total === 0) {
      listEl.innerHTML = '';
      emptyEl.style.display = 'block';
    } else {
      listEl.innerHTML = html;
      emptyEl.style.display = 'none';
    }
  }

  searchEl.addEventListener('input', function (e) {
    searchQuery = e.target.value;
    renderList();
  });

  document.querySelectorAll('.qvr-sph-quickbtn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const catId = btn.dataset.jump;
      activeCategory = catId;
      searchQuery = '';
      searchEl.value = '';
      renderCategories();
      renderList();
      setTimeout(function () {
        const el = document.getElementById('qvr-cat-' + catId);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    });
  });

  renderCategories();
  renderList();
  console.log('%c[SPH] Initialized ✅', 'color:#10b981;font-weight:bold');
};