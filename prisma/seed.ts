process.env.PRISMA_CLIENT_ENGINE_TYPE = 'library';
import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('Seeding the database with political parties and candidates...');

  // Clear existing candidates and parties to avoid duplicates and format issues
  console.log('Clearing existing candidates and parties...');
  await prisma.candidate.deleteMany();
  await prisma.party.deleteMany();

  // --- PARTIES ---
  const partiesData = [
    { name: 'Bharatiya Janata Party', abbreviation: 'BJP', foundedYear: 1980, description: 'One of the two major political parties in India, currently forming the national government.' },
    { name: 'Indian National Congress', abbreviation: 'INC', foundedYear: 1885, description: 'A broad-based political party in India, one of the two major political parties.' },
    { name: 'Aam Aadmi Party', abbreviation: 'AAP', foundedYear: 2012, description: 'Formed following the 2011 Indian anti-corruption movement.' },
    { name: 'All India Trinamool Congress', abbreviation: 'AITC', foundedYear: 1998, description: 'Predominantly active in West Bengal, currently leading the state government.' },
    { name: 'Communist Party of India (Marxist)', abbreviation: 'CPI(M)', foundedYear: 1964, description: 'A communist party in India with a strong presence in Kerala.' },
    { name: 'Bahujan Samaj Party', abbreviation: 'BSP', foundedYear: 1984, description: 'A national party representing Bahujans (SC, ST, and OBC).' },
    { name: 'Samajwadi Party', abbreviation: 'SP', foundedYear: 1992, description: 'A socialist political party active mainly in Uttar Pradesh.' },
    { name: 'Dravida Munnetra Kazhagam', abbreviation: 'DMK', foundedYear: 1949, description: 'A political party based in the state of Tamil Nadu and Puducherry.' }
  ];

  for (const p of partiesData) {
    await prisma.party.create({
      data: {
        id: p.abbreviation,
        name: p.name,
        abbreviation: p.abbreviation,
        foundedYear: p.foundedYear,
        description: p.description
      }
    });
  }

  // Fetch created parties to map their IDs
  const dbParties = await prisma.party.findMany();
  const getPartyId = (abbr: string) => dbParties.find(p => p.abbreviation === abbr)?.id;

  // --- CANDIDATES ---
  const candidatesData = [
    // BJP Candidates
    { name: 'Narendra Modi', constituency: 'Varanasi, Uttar Pradesh', partyId: getPartyId('BJP'), criminalRecords: 'None declared', assets: '₹3+ Crore', education: 'Post Graduate (MA)', background: 'Current Prime Minister of India. Former Chief Minister of Gujarat (2001-2014). Representing Varanasi in Lok Sabha.' },
    { name: 'Amit Shah', constituency: 'Gandhinagar, Gujarat', partyId: getPartyId('BJP'), criminalRecords: '4 cases pending', assets: '₹36+ Crore', education: 'Graduate (B.Sc)', background: 'Current Minister of Home Affairs. Former President of the BJP. Representing Gandhinagar in Lok Sabha.' },
    { name: 'Rajnath Singh', constituency: 'Lucknow, Uttar Pradesh', partyId: getPartyId('BJP'), criminalRecords: 'None declared', assets: '₹5+ Crore', education: 'Post Graduate (M.Sc Physics)', background: 'Current Defence Minister of India. Former Chief Minister of UP. Representing Lucknow in Lok Sabha.' },
    { name: 'Nitin Gadkari', constituency: 'Nagpur, Maharashtra', partyId: getPartyId('BJP'), criminalRecords: '4 cases pending', assets: '₹28+ Crore', education: 'LLB, M.Com', background: 'Minister of Road Transport and Highways. Representing Nagpur in Lok Sabha.' },
    { name: 'Smriti Irani', constituency: 'Amethi, Uttar Pradesh', partyId: getPartyId('BJP'), criminalRecords: 'None declared', assets: '₹17+ Crore', education: 'Under Graduate', background: 'Former Minister of Women and Child Development. Contested from Amethi in Lok Sabha.' },
    
    // INC Candidates
    { name: 'Rahul Gandhi', constituency: 'Raebareli, Uttar Pradesh', partyId: getPartyId('INC'), criminalRecords: '18 cases pending', assets: '₹20+ Crore', education: 'M.Phil', background: 'Former President of INC. Leader of the Opposition in the Lok Sabha. Representing Raebareli in Lok Sabha.' },
    { name: 'Sonia Gandhi', constituency: 'Rajasthan (Rajya Sabha)', partyId: getPartyId('INC'), criminalRecords: 'None declared', assets: '₹12+ Crore', education: 'Diploma', background: 'Former President of INC. Member of Parliament, Rajya Sabha from Rajasthan.' },
    { name: 'Shashi Tharoor', constituency: 'Thiruvananthapuram, Kerala', partyId: getPartyId('INC'), criminalRecords: '1 case pending', assets: '₹55+ Crore', education: 'PhD', background: 'Former Under-Secretary-General of the UN. Author and long-time MP. Representing Thiruvananthapuram in Lok Sabha.' },
    { name: 'Mallikarjun Kharge', constituency: 'Karnataka (Rajya Sabha)', partyId: getPartyId('INC'), criminalRecords: 'None declared', assets: '₹15+ Crore', education: 'LLB', background: 'Current President of the Indian National Congress. Member of Parliament, Rajya Sabha from Karnataka.' },

    // AAP Candidates
    { name: 'Arvind Kejriwal', constituency: 'New Delhi, Delhi', partyId: getPartyId('AAP'), criminalRecords: '47 cases pending', assets: '₹3+ Crore', education: 'B.Tech (IIT Kharagpur)', background: 'Chief Minister of Delhi. MLA representing New Delhi assembly constituency.' },
    { name: 'Bhagwant Mann', constituency: 'Dhuri, Punjab', partyId: getPartyId('AAP'), criminalRecords: '1 case pending', assets: '₹2+ Crore', education: '12th Pass', background: 'Chief Minister of Punjab. MLA representing Dhuri assembly constituency.' },

    // AITC Candidates
    { name: 'Mamata Banerjee', constituency: 'Bhabanipur, West Bengal', partyId: getPartyId('AITC'), criminalRecords: 'None declared', assets: '₹16 Lakh', education: 'LLB, MA', background: 'Chief Minister of West Bengal. Founder of AITC. MLA representing Bhabanipur assembly constituency.' },
    { name: 'Abhishek Banerjee', constituency: 'Diamond Harbour, West Bengal', partyId: getPartyId('AITC'), criminalRecords: 'None declared', assets: '₹1.5 Crore', education: 'BBA, MBA', background: 'National General Secretary of AITC. Representing Diamond Harbour in Lok Sabha.' },
    { name: 'Mahua Moitra', constituency: 'Krishnanagar, West Bengal', partyId: getPartyId('AITC'), criminalRecords: '2 cases pending', assets: '₹3+ Crore', education: 'BA (Economics & Math)', background: 'Former investment banker, prominent parliamentarian. Representing Krishnanagar in Lok Sabha.' },

    // CPI(M)
    { name: 'Sitaram Yechury', constituency: 'Rajya Sabha (Former)', partyId: getPartyId('CPI(M)'), criminalRecords: 'None declared', assets: '₹2+ Crore', education: 'MA Economics', background: 'Former General Secretary of CPI(M).' },
    { name: 'Pinarayi Vijayan', constituency: 'Dharmadam, Kerala', partyId: getPartyId('CPI(M)'), criminalRecords: '1 case pending', assets: '₹1+ Crore', education: 'BA Economics', background: 'Chief Minister of Kerala. MLA representing Dharmadam assembly constituency.' },

    // SP
    { name: 'Akhilesh Yadav', constituency: 'Kannauj, Uttar Pradesh', partyId: getPartyId('SP'), criminalRecords: 'None declared', assets: '₹40+ Crore', education: 'M.E. (Environmental Engineering)', background: 'Former Chief Minister of UP. President of Samajwadi Party. Representing Kannauj in Lok Sabha.' },
    { name: 'Dimple Yadav', constituency: 'Mainpuri, Uttar Pradesh', partyId: getPartyId('SP'), criminalRecords: 'None declared', assets: '₹38+ Crore', education: 'B.Com', background: 'Prominent SP Leader and parliamentarian. Representing Mainpuri in Lok Sabha.' },

    // DMK
    { name: 'M. K. Stalin', constituency: 'Kolathur, Tamil Nadu', partyId: getPartyId('DMK'), criminalRecords: 'Multiple cases pending', assets: '₹7+ Crore', education: 'BA History', background: 'Chief Minister of Tamil Nadu. President of DMK. MLA representing Kolathur assembly constituency.' },
    { name: 'Kanimozhi Karunanidhi', constituency: 'Thoothukkudi, Tamil Nadu', partyId: getPartyId('DMK'), criminalRecords: '1 case pending', assets: '₹30+ Crore', education: 'MA Economics', background: 'Prominent DMK Leader and parliamentarian. Representing Thoothukkudi in Lok Sabha.' }
  ];

  for (const c of candidatesData) {
    if (!c.partyId) continue;
    
    // Check if exists
    const existing = await prisma.candidate.findFirst({
      where: { name: c.name, constituency: c.constituency }
    });

    if (!existing) {
      await prisma.candidate.create({
        data: c as any
      });
    }
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
