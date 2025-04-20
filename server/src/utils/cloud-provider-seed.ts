import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

const prisma = new PrismaClient();

export async function seedCloudProviders() {
  logger.info('Starting cloud providers seeding...');

  const providers = [
    {
      name: 'Amazon Web Services',
      description: 'Amazon Web Services offers reliable, scalable, and inexpensive cloud computing services.',
      website: 'https://aws.amazon.com',
      logo: '/images/providers/aws.svg'
    },
    {
      name: 'Microsoft Azure',
      description: 'Microsoft Azure is a cloud computing service for building, testing, deploying, and managing applications and services.',
      website: 'https://azure.microsoft.com',
      logo: '/images/providers/azure.svg'
    },
    {
      name: 'Google Cloud Platform',
      description: 'Google Cloud Platform offers cloud computing services that run on the same infrastructure that Google uses.',
      website: 'https://cloud.google.com',
      logo: '/images/providers/gcp.svg'
    },
    {
      name: 'IBM Cloud',
      description: 'IBM Cloud offers the most open and secure public cloud for business with a next-generation hybrid cloud platform.',
      website: 'https://www.ibm.com/cloud',
      logo: '/images/providers/ibm.svg'
    },
    {
      name: 'Oracle Cloud',
      description: 'Oracle Cloud Infrastructure offers reliable high-performance cloud services.',
      website: 'https://www.oracle.com/cloud',
      logo: '/images/providers/oracle.svg'
    },
    {
      name: 'DigitalOcean',
      description: 'DigitalOcean provides cloud services that help businesses deploy and scale applications.',
      website: 'https://www.digitalocean.com',
      logo: '/images/providers/digitalocean.svg'
    },
    {
      name: 'Salesforce',
      description: 'Salesforce is a cloud-based software company that provides CRM service and enterprise applications.',
      website: 'https://www.salesforce.com',
      logo: '/images/providers/salesforce.svg'
    },
    {
      name: 'SAP',
      description: 'SAP is a multinational software corporation that makes enterprise software to manage business operations.',
      website: 'https://www.sap.com',
      logo: '/images/providers/sap.svg'
    },
    {
      name: 'ServiceNow',
      description: 'ServiceNow is a cloud computing platform to help companies manage digital workflows.',
      website: 'https://www.servicenow.com',
      logo: '/images/providers/servicenow.svg'
    },
    {
      name: 'Workday',
      description: 'Workday is a cloud-based software vendor specializing in HCM and financial management applications.',
      website: 'https://www.workday.com',
      logo: '/images/providers/workday.svg'
    }
  ];

  for (const provider of providers) {
    // First check if provider already exists
    const existingProvider = await prisma.cloudProvider.findFirst({
      where: { name: provider.name }
    });

    if (existingProvider) {
      // Update existing provider
      await prisma.cloudProvider.update({
        where: { id: existingProvider.id },
        data: provider
      });
    } else {
      // Create new provider
      await prisma.cloudProvider.create({
        data: provider
      });
    }
  }

  logger.info('Cloud providers seeding completed!');
}

// Main seed function to populate cloud services
export async function seedCloudServices() {
  logger.info('Starting cloud services seeding...');
  
  // First get the providers
  const aws = await prisma.cloudProvider.findFirst({
    where: { name: 'Amazon Web Services' }
  });
  
  const azure = await prisma.cloudProvider.findFirst({
    where: { name: 'Microsoft Azure' }
  });
  
  const gcp = await prisma.cloudProvider.findFirst({
    where: { name: 'Google Cloud Platform' }
  });

  // Sample services for AWS
  if (aws) {
    const awsServices = [
      {
        name: 'Amazon EC2',
        type: 'Compute',
        description: 'Scalable virtual servers in the cloud',
        providerId: aws.id,
        basicPrice: 0.0104,
        basicFeatures: ['2 vCPU', '1 GiB RAM', 'Linux OS'],
        basicLimitations: ['Pay as you go', 'No upfront commitment'],
        standardPrice: 0.0208,
        standardFeatures: ['2 vCPU', '2 GiB RAM', 'Linux OS', 'Burstable performance'],
        standardLimitations: ['Pay as you go', 'No upfront commitment'],
        premiumPrice: 0.0416,
        premiumFeatures: ['2 vCPU', '4 GiB RAM', 'Linux OS', 'Burstable performance', 'Enhanced networking'],
        premiumLimitations: ['Pay as you go', 'No upfront commitment']
      },
      {
        name: 'Amazon RDS',
        type: 'Database',
        description: 'Managed relational database service',
        providerId: aws.id,
        basicPrice: 0.017,
        basicFeatures: ['1 GB RAM', '1 vCPU', 'MySQL compatible'],
        basicLimitations: ['Limited I/O', 'No Multi-AZ'],
        standardPrice: 0.034,
        standardFeatures: ['2 GB RAM', '1 vCPU', 'MySQL compatible', 'Moderate I/O'],
        standardLimitations: ['No Multi-AZ'],
        premiumPrice: 0.068,
        premiumFeatures: ['4 GB RAM', '2 vCPU', 'MySQL compatible', 'Provisioned IOPS', 'Multi-AZ option'],
        premiumLimitations: ['Additional costs for storage']
      },
      {
        name: 'AWS Elastic Beanstalk',
        type: 'Platform',
        description: 'Easy-to-use service for deploying and scaling web applications',
        providerId: aws.id,
        basicPrice: 0,
        basicFeatures: ['Automatic scaling', 'Load balancing', 'Multiple programming languages support'],
        basicLimitations: ['Pay only for underlying resources', 'No service-specific charges']
      },
      {
        name: 'Amazon EKS',
        type: 'Containers',
        description: 'Managed Kubernetes service',
        providerId: aws.id,
        basicPrice: 0.10,
        basicFeatures: ['Managed Kubernetes control plane', 'Automated upgrades', 'Integration with AWS services'],
        basicLimitations: ['Per cluster fee', 'Additional charges for worker nodes', 'Storage costs extra']
      }
    ];

    for (const service of awsServices) {
      // Check if service already exists
      const existingService = await prisma.cloudService.findFirst({
        where: {
          AND: [
            { name: service.name },
            { providerId: service.providerId }
          ]
        }
      });

      if (existingService) {
        // Update existing service
        await prisma.cloudService.update({
          where: { id: existingService.id },
          data: service
        });
      } else {
        // Create new service
        await prisma.cloudService.create({
          data: service
        });
      }
    }
  }
  
  // Sample services for Azure
  if (azure) {
    const azureServices = [
      {
        name: 'Azure Virtual Machines',
        type: 'Compute',
        description: 'Azure compute service to deploy scalable VMs',
        providerId: azure.id,
        basicPrice: 0.0104,
        basicFeatures: ['1 vCPU', '1 GiB RAM', 'Windows or Linux'],
        basicLimitations: ['Limited IOPS', 'Basic support'],
        standardPrice: 0.0416,
        standardFeatures: ['2 vCPU', '4 GiB RAM', 'Windows or Linux', 'Standard storage'],
        standardLimitations: ['Standard support'],
        premiumPrice: 0.1664,
        premiumFeatures: ['4 vCPU', '16 GiB RAM', 'Windows or Linux', 'Premium storage', 'Advanced monitoring'],
        premiumLimitations: ['Premium support costs extra']
      },
      {
        name: 'Azure SQL Database',
        type: 'Database',
        description: 'Fully managed SQL database with AI capabilities',
        providerId: azure.id,
        basicPrice: 0.023,
        basicFeatures: ['5 DTUs', '2 GB storage', 'Basic availability'],
        basicLimitations: ['Limited performance', 'No long-term backup retention'],
        standardPrice: 0.075,
        standardFeatures: ['20 DTUs', '250 GB storage', 'Standard availability'],
        standardLimitations: ['Limited scaling options'],
        premiumPrice: 0.465,
        premiumFeatures: ['125 DTUs', '500 GB storage', 'Premium availability', 'Advanced threat protection'],
        premiumLimitations: ['Higher costs for additional storage']
      },
      {
        name: 'Azure App Service',
        type: 'Platform',
        description: 'Build, deploy, and scale web apps on a managed platform',
        providerId: azure.id,
        freePrice: 0,
        freeFeatures: ['Up to 10 apps', '1 GB storage', 'Shared computing resources'],
        freeLimitations: ['No SLA', 'Shared infrastructure', '60 minutes compute per day'],
        basicPrice: 0.075,
        basicFeatures: ['1 core', '1.75 GB RAM', 'Custom domains'],
        basicLimitations: ['No auto-scale', 'No staging slots'],
        standardPrice: 0.15,
        standardFeatures: ['2 cores', '3.5 GB RAM', 'Auto-scaling', 'Staging slots'],
        standardLimitations: ['Premium features not available']
      },
      {
        name: 'Azure Kubernetes Service (AKS)',
        type: 'Containers',
        description: 'Managed Kubernetes container orchestration service',
        providerId: azure.id,
        basicPrice: 0,
        basicFeatures: ['No charge for cluster management', 'Integrated with Azure tools', 'Automated upgrades'],
        basicLimitations: ['Pay for VM resources', 'Networking costs extra', 'Storage costs extra']
      }
    ];

    for (const service of azureServices) {
      // Check if service already exists
      const existingService = await prisma.cloudService.findFirst({
        where: {
          AND: [
            { name: service.name },
            { providerId: service.providerId }
          ]
        }
      });

      if (existingService) {
        // Update existing service
        await prisma.cloudService.update({
          where: { id: existingService.id },
          data: service
        });
      } else {
        // Create new service
        await prisma.cloudService.create({
          data: service
        });
      }
    }
  }
  
  // Sample services for GCP
  if (gcp) {
    const gcpServices = [
      {
        name: 'Google Compute Engine',
        type: 'Compute',
        description: "Virtual machines running in Google's data centers",
        providerId: gcp.id,
        basicPrice: 0.0083,
        basicFeatures: ['2 vCPU', '1 GB RAM', 'Shared core'],
        basicLimitations: ['Limited network performance', 'Standard persistent disk only'],
        standardPrice: 0.0166,
        standardFeatures: ['2 vCPU', '2 GB RAM', 'Dedicated core'],
        standardLimitations: ['Standard network performance'],
        premiumPrice: 0.0334,
        premiumFeatures: ['2 vCPU', '4 GB RAM', 'Dedicated core', 'Higher network throughput'],
        premiumLimitations: ['Premium support costs extra']
      },
      {
        name: 'Cloud SQL',
        type: 'Database',
        description: 'Fully managed relational database service',
        providerId: gcp.id,
        basicPrice: 0.0150,
        basicFeatures: ['1 shared CPU', '0.6 GB RAM', 'MySQL, PostgreSQL, or SQL Server'],
        basicLimitations: ['Limited storage', 'Basic availability'],
        standardPrice: 0.0350,
        standardFeatures: ['1 shared CPU', '1.7 GB RAM', 'MySQL, PostgreSQL, or SQL Server', 'Automatic backups'],
        standardLimitations: ['Standard performance'],
        premiumPrice: 0.0900,
        premiumFeatures: ['2 vCPU', '4 GB RAM', 'MySQL, PostgreSQL, or SQL Server', 'High availability', 'Automated failover'],
        premiumLimitations: ['Higher costs for storage and network']
      },
      {
        name: 'Google App Engine',
        type: 'Platform',
        description: 'Platform for building scalable web applications and mobile backends',
        providerId: gcp.id,
        freePrice: 0,
        freeFeatures: ['Limited usage quotas', 'Standard environment runtimes', 'Automatic scaling'],
        freeLimitations: ['Quotas apply to free tier', 'Limited instance hours', 'No SLA'],
        basicPrice: 0.05,
        basicFeatures: ['Standard environment', 'Automatic scaling', 'Application versioning'],
        basicLimitations: ['Per instance hour billing'],
        standardPrice: 0.0538,
        standardFeatures: ['Flexible environment', 'Custom runtimes', 'Background processes'],
        standardLimitations: ['Per vCPU, memory, and disk billing']
      },
      {
        name: 'Google Kubernetes Engine (GKE)',
        type: 'Containers',
        description: 'Managed Kubernetes service',
        providerId: gcp.id,
        basicPrice: 0.10,
        basicFeatures: ['Standard GKE clusters', 'Cluster management', 'Automatic updates'],
        basicLimitations: ['Per cluster fee', 'Node compute costs extra'],
        standardPrice: 0,
        standardFeatures: ['Autopilot mode', 'Fully managed Kubernetes', 'Pod-level autoscaling'],
        standardLimitations: ['Pay only for Pod resources', 'Limited configuration options']
      }
    ];

    for (const service of gcpServices) {
      // Check if service already exists
      const existingService = await prisma.cloudService.findFirst({
        where: {
          AND: [
            { name: service.name },
            { providerId: service.providerId }
          ]
        }
      });

      if (existingService) {
        // Update existing service
        await prisma.cloudService.update({
          where: { id: existingService.id },
          data: service
        });
      } else {
        // Create new service
        await prisma.cloudService.create({
          data: service
        });
      }
    }
  }

  logger.info('Cloud services seeding completed!');
}

// Main seed function
export async function seedCloudData() {
  try {
    logger.info('Starting cloud data seeding...');
    await seedCloudProviders();
    await seedCloudServices();
    logger.info('Cloud data seeding completed successfully!');
  } catch (error) {
    logger.error('Error seeding cloud data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
} 