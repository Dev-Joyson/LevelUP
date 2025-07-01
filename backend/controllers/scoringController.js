// Skill categories mapping for intelligent matching
const skillCategories = {
  frontend: ['react', 'vue', 'angular', 'svelte', 'html', 'css', 'javascript', 'typescript', 'jquery', 'bootstrap', 'tailwind', 'sass', 'less'],
  backend: ['node.js', 'python', 'java', 'c#', 'php', 'go', 'ruby', 'rust', 'scala', 'kotlin', 'express', 'django', 'spring', 'laravel', 'fastapi'],
  database: ['mysql', 'postgresql', 'mongodb', 'redis', 'sqlite', 'oracle', 'sql server', 'mariadb', 'cassandra', 'neo4j'],
  cloud: ['aws', 'azure', 'gcp', 'heroku', 'digitalocean', 'firebase', 'vercel', 'netlify', 'cloudflare'],
  tools: ['git', 'docker', 'jenkins', 'jira', 'figma', 'postman', 'vscode', 'intellij', 'eclipse', 'github', 'gitlab', 'bitbucket'],
  mobile: ['react native', 'flutter', 'swift', 'kotlin', 'xamarin', 'ionic', 'cordova'],
  ai_ml: ['tensorflow', 'pytorch', 'scikit-learn', 'pandas', 'numpy', 'matplotlib', 'opencv', 'nltk', 'spacy'],
  devops: ['kubernetes', 'terraform', 'ansible', 'jenkins', 'gitlab ci', 'github actions', 'docker compose', 'helm']
};

// Calculate match score based on resume data and internship criteria
const calculateMatchScore = (resumeData, internship) => {
  console.log('=== SCORING FUNCTION CALLED ===');
  console.log('Resume data received:', JSON.stringify(resumeData, null, 2));
  console.log('Internship received:', JSON.stringify(internship, null, 2));
  
  const debug = {
    resumeData: resumeData,
    internship: internship,
    matchingCriteria: internship.matchingCriteria,
    steps: []
  };
  
  const criteria = internship.matchingCriteria;
  
  const breakdown = {
    skills: 0,
    projects: 0,
    experience: 0,
    gpa: 0,
    certifications: 0
  };

  const details = {
    skillsMatched: [],
    projectsCount: 0,
    experienceCount: 0,
    gpaValue: 0,
    certificationsCount: 0
  };

  // Step 1: Skills Matching (50% default weight)
  if (criteria.skills > 0) {
    debug.steps.push(`Skills criteria weight: ${criteria.skills}`);
    
    // Extract skills from the actual resume parser output structure
    const allResumeSkills = [];
    
    // Handle the actual structure from resume parser
    if (resumeData.Skills) {
      Object.values(resumeData.Skills).forEach(skillArray => {
        if (Array.isArray(skillArray)) {
          allResumeSkills.push(...skillArray.map(skill => skill.toLowerCase()));
        }
      });
    }
    
    // Fallback to old structure if needed
    if (allResumeSkills.length === 0) {
      const fallbackSkills = [
        ...(resumeData.skills?.['Programming Languages'] || []),
        ...(resumeData.skills?.['Frameworks & Libraries'] || []),
        ...(resumeData.skills?.Tools || []),
        ...(resumeData.skills?.['Cloud Platforms'] || []),
        ...(resumeData.skills?.Databases || []),
        ...(resumeData.skills?.Other || []),
        // Fallback to old structure
        ...(resumeData.skills?.programmingLanguages || []),
        ...(resumeData.skills?.frameworks || []),
        ...(resumeData.skills?.tools || []),
        ...(resumeData.skills?.cloudPlatforms || []),
        ...(resumeData.skills?.databases || []),
        ...(resumeData.skills?.other || [])
      ].map(skill => skill.toLowerCase());
      allResumeSkills.push(...fallbackSkills);
    }

    debug.steps.push(`All Resume Skills: ${allResumeSkills.join(', ')}`);

    const requiredSkills = [
      ...(internship.criteria?.skills || []),
      ...(internship.preferredSkills || [])
    ].map(skill => skill.toLowerCase());

    debug.steps.push(`Required Skills: ${requiredSkills.join(', ')}`);

    if (requiredSkills.length > 0) {
      const matchedSkills = [];
      
      // Check for exact matches and category matches
      requiredSkills.forEach(requiredSkill => {
        debug.steps.push(`Checking skill: ${requiredSkill}`);
        // Exact match
        if (allResumeSkills.includes(requiredSkill)) {
          debug.steps.push(`Exact match found: ${requiredSkill}`);
          matchedSkills.push(requiredSkill);
          return;
        }
        
        // Category match
        for (const [category, skills] of Object.entries(skillCategories)) {
          if (skills.includes(requiredSkill) || requiredSkill.includes(category)) {
            const categoryMatches = allResumeSkills.filter(skill => 
              skills.includes(skill) || skill.includes(category)
            );
            if (categoryMatches.length > 0) {
              debug.steps.push(`Category match found: ${categoryMatches.join(', ')}`);
              matchedSkills.push(...categoryMatches);
              break;
            }
          }
        }
        
        // Partial/fuzzy matching
        const partialMatches = allResumeSkills.filter(skill => 
          skill.includes(requiredSkill) || requiredSkill.includes(skill)
        );
        if (partialMatches.length > 0) {
          debug.steps.push(`Partial match found: ${partialMatches.join(', ')}`);
          matchedSkills.push(...partialMatches);
        }
      });

      // Remove duplicates
      const uniqueMatches = [...new Set(matchedSkills)];
      details.skillsMatched = uniqueMatches;
      
      const matchRatio = uniqueMatches.length / requiredSkills.length;
      breakdown.skills = Math.min(matchRatio * criteria.skills, criteria.skills);
      
      debug.steps.push(`Skills calculation: uniqueMatches=${uniqueMatches.join(', ')}, matchRatio=${matchRatio}, criteriaSkills=${criteria.skills}, breakdownSkills=${breakdown.skills}`);
    } else {
      // If no specific skills required, give partial credit for having skills
      breakdown.skills = allResumeSkills.length > 0 ? criteria.skills * 0.7 : 0;
      debug.steps.push(`No required skills, giving partial credit: ${breakdown.skills}`);
    }
  } else {
    debug.steps.push('Skills criteria weight is 0, skipping skills scoring');
  }

  // Step 2: Projects Scoring (20% default weight)
  if (criteria.projects > 0) {
    const projects = resumeData.Projects || resumeData.projects || [];
    details.projectsCount = projects.length;
    
    if (projects.length > 0) {
      // Score based on number of projects (max score for 3+ projects)
      const projectScore = Math.min(projects.length / 3, 1);
      
      // Bonus for relevant technologies
      let techBonus = 0;
      const requiredSkills = [
        ...(internship.criteria?.skills || []),
        ...(internship.preferredSkills || [])
      ].map(skill => skill.toLowerCase());
      
      projects.forEach(project => {
        const projectTechs = (project.technologies || project.Technologies || []).map(tech => tech.toLowerCase());
        const relevantTechs = projectTechs.filter(tech => 
          requiredSkills.some(skill => 
            tech.includes(skill) || skill.includes(tech) ||
            Object.values(skillCategories).some(categorySkills => 
              categorySkills.includes(tech) && categorySkills.includes(skill)
            )
          )
        );
        if (relevantTechs.length > 0) {
          techBonus += 0.1; // 10% bonus per relevant project
        }
      });
      
      const finalProjectScore = Math.min(projectScore + techBonus, 1);
      breakdown.projects = finalProjectScore * criteria.projects;
    }
  }

  // Step 3: Experience Scoring (15% default weight)
  if (criteria.experience > 0) {
    const experience = resumeData.Experience || resumeData.experience || [];
    details.experienceCount = experience.length;
    
    if (experience.length > 0) {
      // Score based on number of experiences (max score for 2+ experiences)
      const experienceScore = Math.min(experience.length / 2, 1);
      
      // Bonus for relevant experience
      let relevanceBonus = 0;
      const requiredSkills = [
        ...(internship.criteria?.skills || []),
        ...(internship.preferredSkills || [])
      ].map(skill => skill.toLowerCase());
      
      experience.forEach(exp => {
        const roleLower = (exp.role || exp.Role || '').toLowerCase();
        const descriptionLower = (exp.description || exp.Description || '').toLowerCase();
        
        const relevantSkills = requiredSkills.filter(skill => 
          roleLower.includes(skill) || descriptionLower.includes(skill)
        );
        if (relevantSkills.length > 0) {
          relevanceBonus += 0.15; // 15% bonus per relevant experience
        }
      });
      
      const finalExperienceScore = Math.min(experienceScore + relevanceBonus, 1);
      breakdown.experience = finalExperienceScore * criteria.experience;
    }
  }

  // Step 4: GPA Scoring (10% default weight)
  if (criteria.gpa > 0) {
    const gpa = resumeData.gpa || 0;
    const minimumGPA = internship.minimumGPA || 0;
    details.gpaValue = gpa;
    
    if (gpa > 0) {
      if (gpa >= minimumGPA) {
        // Score based on GPA (assuming 4.0 scale)
        const gpaScore = Math.min(gpa / 4.0, 1);
        breakdown.gpa = gpaScore * criteria.gpa;
      }
    } else if (minimumGPA === 0) {
      // If no GPA provided and none required, give partial credit
      breakdown.gpa = criteria.gpa * 0.5;
    }
  }

  // Step 5: Certifications Scoring (5% default weight)
  if (criteria.certifications > 0) {
    const certifications = resumeData.certifications || [];
    details.certificationsCount = certifications.length;
    
    if (certifications.length > 0) {
      // Score based on number of certifications (max score for 2+ certs)
      const certScore = Math.min(certifications.length / 2, 1);
      
      // Bonus for relevant certifications
      let relevanceBonus = 0;
      const requiredSkills = [
        ...(internship.criteria?.skills || []),
        ...(internship.preferredSkills || [])
      ].map(skill => skill.toLowerCase());
      
      certifications.forEach(cert => {
        const certLower = cert.toLowerCase();
        const relevantSkills = requiredSkills.filter(skill => 
          certLower.includes(skill) ||
          Object.values(skillCategories).some(categorySkills => 
            categorySkills.includes(skill) && certLower.includes(skill)
          )
        );
        if (relevantSkills.length > 0) {
          relevanceBonus += 0.1; // 10% bonus per relevant certification
        }
      });
      
      const finalCertScore = Math.min(certScore + relevanceBonus, 1);
      breakdown.certifications = finalCertScore * criteria.certifications;
    }
  }

  // Calculate total score
  const total = Math.round(
    breakdown.skills + 
    breakdown.projects + 
    breakdown.experience + 
    breakdown.gpa + 
    breakdown.certifications
  );

  const result = { 
    total, 
    breakdown,
    details,
    debug
  };

  console.log('Final Score Result:', result);
  return result;
};

export { calculateMatchScore, skillCategories }; 