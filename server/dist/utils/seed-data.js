"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedTools = seedTools;
exports.runSeed = runSeed;
const client_1 = require("@prisma/client");
const logger_1 = require("./logger");
const prisma = new client_1.PrismaClient();
// Common integrations for SaaS tools
const commonIntegrations = [
    'Slack', 'Google Drive', 'Dropbox', 'Microsoft Office', 'Zoom',
    'GitHub', 'GitLab', 'Jira', 'Trello', 'Asana', 'Salesforce', 'HubSpot',
    'Zapier', 'Microsoft Teams', 'Google Calendar', 'Microsoft Outlook',
    'Gmail', 'AWS', 'Azure', 'Google Cloud Platform'
];
// Common feature names for SaaS tools
const commonFeatures = {
    'Core Features': [
        'API Access', 'Customization', 'White-labeling', 'Offline Access',
        'Mobile App', 'Desktop App', 'Browser Extension', 'Custom Fields',
        'Custom Workflows', 'Automations', 'Templates'
    ],
    'Support': [
        '24/7 Support', 'Knowledge Base', 'Community Forum', 'Training',
        'Dedicated Account Manager', 'Priority Support', 'Live Chat',
        'Phone Support', 'Email Support', 'Onboarding'
    ],
    'Security': [
        'Two-factor Auth', 'SSO', 'Encryption', 'Audit Logs',
        'GDPR Compliance', 'HIPAA Compliance', 'SOC 2 Compliance',
        'ISO 27001 Compliance', 'Data Backup', 'Role-based Access Control'
    ],
    'Integration': [
        'Native Integrations', 'API Documentation', 'Webhooks', 'Zapier Support',
        'REST API', 'GraphQL API', 'OAuth 2.0', 'SDK'
    ]
};
// Common pricing tiers
const pricingTiers = ['Free', 'Starter', 'Professional', 'Enterprise'];
// Sample SaaS tools data for seeding
const tools = [
    // Communication
    {
        name: 'Slack',
        website: 'https://slack.com',
        logo: 'https://logo.clearbit.com/slack.com',
        description: 'Slack is a messaging app for business that connects people to the information they need.',
        category: 'Communication',
    },
    {
        name: 'Microsoft Teams',
        website: 'https://www.microsoft.com/microsoft-teams',
        logo: 'https://logo.clearbit.com/microsoft.com',
        description: 'Microsoft Teams is the hub for team collaboration in Microsoft 365 that integrates people, content, and tools.',
        category: 'Communication',
    },
    {
        name: 'Zoom',
        website: 'https://zoom.us',
        logo: 'https://logo.clearbit.com/zoom.us',
        description: 'Zoom is a video conferencing platform that provides video and audio conferencing, chat, and webinars.',
        category: 'Communication',
    },
    {
        name: 'Discord',
        website: 'https://discord.com',
        logo: 'https://logo.clearbit.com/discord.com',
        description: 'Discord is a voice, video, and text communication platform designed for creating communities.',
        category: 'Communication',
    },
    // Project Management
    {
        name: 'Asana',
        website: 'https://asana.com',
        logo: 'https://logo.clearbit.com/asana.com',
        description: 'Asana helps teams orchestrate their work, from daily tasks to strategic initiatives.',
        category: 'Project Management',
    },
    {
        name: 'Trello',
        website: 'https://trello.com',
        logo: 'https://logo.clearbit.com/trello.com',
        description: 'Trello helps teams move work forward using boards, lists, and cards to organize projects.',
        category: 'Project Management',
    },
    {
        name: 'Monday.com',
        website: 'https://monday.com',
        logo: 'https://logo.clearbit.com/monday.com',
        description: 'Monday.com is a work operating system that powers teams to run processes, projects, and everyday work.',
        category: 'Project Management',
    },
    {
        name: 'Jira',
        website: 'https://www.atlassian.com/software/jira',
        logo: 'https://logo.clearbit.com/atlassian.com',
        description: 'Jira is an issue tracking and project management tool used for software development.',
        category: 'Project Management',
    },
    {
        name: 'ClickUp',
        website: 'https://clickup.com',
        logo: 'https://logo.clearbit.com/clickup.com',
        description: 'ClickUp is a productivity platform that provides task management, docs, goals, and more in one place.',
        category: 'Project Management',
    },
    // Productivity
    {
        name: 'Notion',
        website: 'https://www.notion.so',
        logo: 'https://logo.clearbit.com/notion.so',
        description: 'Notion is an all-in-one workspace for notes, tasks, wikis, and databases.',
        category: 'Productivity',
    },
    {
        name: 'Evernote',
        website: 'https://evernote.com',
        logo: 'https://logo.clearbit.com/evernote.com',
        description: 'Evernote is a note-taking app that lets you capture and prioritize ideas, projects, and to-do lists.',
        category: 'Productivity',
    },
    {
        name: 'Todoist',
        website: 'https://todoist.com',
        logo: 'https://logo.clearbit.com/todoist.com',
        description: 'Todoist is a task management application that helps you organize and prioritize your tasks.',
        category: 'Productivity',
    },
    // CRM
    {
        name: 'Salesforce',
        website: 'https://www.salesforce.com',
        logo: 'https://logo.clearbit.com/salesforce.com',
        description: 'Salesforce is a customer relationship management platform that helps businesses connect with customers.',
        category: 'CRM',
    },
    {
        name: 'HubSpot',
        website: 'https://www.hubspot.com',
        logo: 'https://logo.clearbit.com/hubspot.com',
        description: 'HubSpot is an inbound marketing and sales platform that helps companies attract visitors, convert leads, and close customers.',
        category: 'CRM',
    },
    {
        name: 'Zoho CRM',
        website: 'https://www.zoho.com/crm',
        logo: 'https://logo.clearbit.com/zoho.com',
        description: 'Zoho CRM is a web-based CRM designed to attract, retain, and satisfy customers.',
        category: 'CRM',
    },
    // HR & People Management
    {
        name: 'Workday',
        website: 'https://www.workday.com',
        logo: 'https://logo.clearbit.com/workday.com',
        description: 'Workday is a cloud-based software vendor that specializes in human capital management and financial management applications.',
        category: 'HR',
    },
    {
        name: 'BambooHR',
        website: 'https://www.bamboohr.com',
        logo: 'https://logo.clearbit.com/bamboohr.com',
        description: 'BambooHR is an HR software service that helps growing companies manage essential employee information.',
        category: 'HR',
    },
    {
        name: 'Gusto',
        website: 'https://gusto.com',
        logo: 'https://logo.clearbit.com/gusto.com',
        description: 'Gusto provides a cloud-based payroll, benefits, and human resource management platform for businesses.',
        category: 'HR',
    },
    // Analytics
    {
        name: 'Google Analytics',
        website: 'https://analytics.google.com',
        logo: 'https://logo.clearbit.com/google.com',
        description: 'Google Analytics is a web analytics service that tracks and reports website traffic.',
        category: 'Analytics',
    },
    {
        name: 'Tableau',
        website: 'https://www.tableau.com',
        logo: 'https://logo.clearbit.com/tableau.com',
        description: 'Tableau is a visual analytics platform that helps people see and understand data.',
        category: 'Analytics',
    },
    {
        name: 'Mixpanel',
        website: 'https://mixpanel.com',
        logo: 'https://logo.clearbit.com/mixpanel.com',
        description: 'Mixpanel is a business analytics service company that tracks user interactions with web and mobile applications.',
        category: 'Analytics',
    },
    // IaaS
    {
        name: 'AWS EC2',
        website: 'https://aws.amazon.com/ec2',
        logo: 'https://logo.clearbit.com/aws.amazon.com',
        description: 'Amazon Elastic Compute Cloud (EC2) is a web service that provides secure, resizable compute capacity in the cloud.',
        category: 'IaaS',
    },
    {
        name: 'Google Compute Engine',
        website: 'https://cloud.google.com/compute',
        logo: 'https://logo.clearbit.com/cloud.google.com',
        description: 'Google Compute Engine delivers virtual machines running in Google data centers.',
        category: 'IaaS',
    },
    {
        name: 'Azure Virtual Machines',
        website: 'https://azure.microsoft.com/services/virtual-machines',
        logo: 'https://logo.clearbit.com/azure.com',
        description: 'Azure Virtual Machines provides on-demand, scalable computing resources.',
        category: 'IaaS',
    },
    // PaaS
    {
        name: 'Heroku',
        website: 'https://www.heroku.com',
        logo: 'https://logo.clearbit.com/heroku.com',
        description: 'Heroku is a platform as a service that enables developers to build, run, and operate applications entirely in the cloud.',
        category: 'PaaS',
    },
    {
        name: 'Google App Engine',
        website: 'https://cloud.google.com/appengine',
        logo: 'https://logo.clearbit.com/cloud.google.com',
        description: 'Google App Engine is a Platform as a Service for developing and hosting web applications in Google-managed data centers.',
        category: 'PaaS',
    },
    {
        name: 'Azure App Service',
        website: 'https://azure.microsoft.com/services/app-service',
        logo: 'https://logo.clearbit.com/azure.com',
        description: 'Azure App Service enables you to build and host web apps, mobile back ends, and RESTful APIs in the programming language of your choice.',
        category: 'PaaS',
    },
    // Kubernetes
    {
        name: 'Google Kubernetes Engine',
        website: 'https://cloud.google.com/kubernetes-engine',
        logo: 'https://logo.clearbit.com/cloud.google.com',
        description: 'Google Kubernetes Engine is a managed Kubernetes service with enterprise-grade security.',
        category: 'Kubernetes',
    },
    {
        name: 'Amazon EKS',
        website: 'https://aws.amazon.com/eks',
        logo: 'https://logo.clearbit.com/aws.amazon.com',
        description: 'Amazon Elastic Kubernetes Service is a managed Kubernetes service that makes it easy to run Kubernetes on AWS.',
        category: 'Kubernetes',
    },
    {
        name: 'Azure Kubernetes Service',
        website: 'https://azure.microsoft.com/services/kubernetes-service',
        logo: 'https://logo.clearbit.com/azure.com',
        description: 'Azure Kubernetes Service offers serverless Kubernetes, an integrated CI/CD experience, and enterprise-grade security.',
        category: 'Kubernetes',
    },
    // Redis as a Service
    {
        name: 'Redis Cloud',
        website: 'https://redis.com/redis-enterprise-cloud',
        logo: 'https://logo.clearbit.com/redis.com',
        description: 'Redis Cloud is a fully-managed cloud service for hosting and running Redis datasets.',
        category: 'Database',
    },
    {
        name: 'AWS ElastiCache for Redis',
        website: 'https://aws.amazon.com/elasticache/redis',
        logo: 'https://logo.clearbit.com/aws.amazon.com',
        description: 'Amazon ElastiCache for Redis is a Redis-compatible in-memory data structure store managed by AWS.',
        category: 'Database',
    },
    {
        name: 'Azure Cache for Redis',
        website: 'https://azure.microsoft.com/services/cache',
        logo: 'https://logo.clearbit.com/azure.com',
        description: 'Azure Cache for Redis is a fully managed, Redis-compatible caching service from Microsoft.',
        category: 'Database',
    },
];
/**
 * Seeds the database with sample SaaS tools
 */
async function seedTools() {
    logger_1.logger.info('Starting database seeding...');
    try {
        // Fixed: Use prisma client safely with proper error handling
        const existingToolsCount = await prisma.saasTool.count();
        if (existingToolsCount > 0) {
            logger_1.logger.info(`Database already has ${existingToolsCount} tools. Skipping seed.`);
            return;
        }
        // First create integrations
        logger_1.logger.info('Creating integrations...');
        for (const integration of commonIntegrations) {
            await prisma.integration.upsert({
                where: { name: integration },
                update: {},
                create: { name: integration }
            });
        }
        // Seed tools with pricing plans, features, and integrations
        for (const tool of tools) {
            logger_1.logger.info(`Creating tool: ${tool.name}`);
            // Create the tool
            const createdTool = await prisma.saasTool.create({
                data: {
                    name: tool.name,
                    website: tool.website,
                    logo: tool.logo,
                    description: tool.description,
                    category: tool.category,
                },
            });
            // Add pricing plans
            for (const tier of pricingTiers) {
                const price = tier === 'Free' ? 0 :
                    tier === 'Starter' ? Math.floor(Math.random() * 20) + 5 :
                        tier === 'Professional' ? Math.floor(Math.random() * 50) + 25 :
                            null; // Enterprise is custom pricing
                const pricingPlan = await prisma.pricingPlan.create({
                    data: {
                        name: tier,
                        price: price,
                        isCustomPricing: tier === 'Enterprise',
                        saasToolId: createdTool.id
                    }
                });
                // Add features for each plan
                const featureCount = tier === 'Free' ? 5 :
                    tier === 'Starter' ? 10 :
                        tier === 'Professional' ? 15 :
                            20; // Enterprise gets most features
                let featuresAdded = 0;
                for (const category in commonFeatures) {
                    for (const feature of commonFeatures[category]) {
                        if (featuresAdded < featureCount) {
                            await prisma.feature.create({
                                data: {
                                    name: feature,
                                    pricingPlanId: pricingPlan.id
                                }
                            });
                            featuresAdded++;
                        }
                    }
                }
                // Add limitations for lower tiers
                if (tier !== 'Enterprise') {
                    const limitations = [
                        tier === 'Free' ? 'Limited to 3 users' :
                            tier === 'Starter' ? 'Limited to 10 users' : 'Limited to 50 users',
                        tier === 'Free' ? 'Limited storage (5 GB)' :
                            tier === 'Starter' ? 'Limited storage (20 GB)' : 'Limited storage (100 GB)',
                        tier === 'Free' ? 'Email support only' :
                            tier === 'Starter' ? 'Email and chat support' : 'Priority support',
                    ];
                    for (const limitation of limitations) {
                        await prisma.limitation.create({
                            data: {
                                name: limitation,
                                pricingPlanId: pricingPlan.id
                            }
                        });
                    }
                }
            }
            // Add integrations (randomly 3-8 integrations per tool)
            const integrationCount = Math.floor(Math.random() * 6) + 3;
            const shuffledIntegrations = [...commonIntegrations].sort(() => 0.5 - Math.random());
            const selectedIntegrations = shuffledIntegrations.slice(0, integrationCount);
            for (const integration of selectedIntegrations) {
                await prisma.$executeRaw `
          INSERT INTO "_IntegrationToSaasTool" ("A", "B")
          VALUES (
            (SELECT "id" FROM "Integration" WHERE "name" = ${integration}),
            ${createdTool.id}
          )
        `;
            }
            logger_1.logger.info(`Created tool: ${tool.name} with pricing plans, features, and integrations`);
        }
        logger_1.logger.info('Database seeding completed successfully!');
    }
    catch (error) {
        logger_1.logger.error('Error seeding database:', error);
        throw error; // Re-throw to ensure calling code knows seeding failed
    }
    finally {
        await prisma.$disconnect();
    }
}
/**
 * Create a seed script to run from API routes
 */
async function runSeed() {
    try {
        await seedTools();
        return { success: true, message: 'Database seeded successfully' };
    }
    catch (error) {
        logger_1.logger.error('Seed error:', error);
        return { success: false, message: 'Error seeding database', error: String(error) };
    }
}
// Run seed if script is executed directly
if (require.main === module) {
    seedTools()
        .then(() => logger_1.logger.info('Seeding complete'))
        .catch((e) => logger_1.logger.error('Error seeding:', e));
}
