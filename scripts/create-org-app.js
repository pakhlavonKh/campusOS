const fs = require('fs');
const path = require('path');

function parseArgs() {
  const args = {};
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      const key = argv[i].substring(2);
      const val = argv[i + 1];
      if (val && !val.startsWith('--')) {
        args[key] = val;
        i++;
      } else {
        args[key] = 'true';
      }
    }
  }
  return args;
}

function copyRecursiveSync(src, dest, replacements) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats && stats.isDirectory();

  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(
        path.join(src, childItemName),
        path.join(dest, childItemName),
        replacements
      );
    });
  } else {
    const ext = path.extname(src).toLowerCase();
    const isTextFile = ['.json', '.html', '.ts', '.tsx', '.css', '.js'].includes(ext);

    if (isTextFile) {
      let content = fs.readFileSync(src, 'utf8');
      for (const [key, value] of Object.entries(replacements)) {
        content = content.replace(new RegExp(`{{${key}}}`, 'g'), value);
      }
      fs.writeFileSync(dest, content, 'utf8');
    } else {
      fs.copyFileSync(src, dest);
    }
  }
}

function updateWorkspaceConfig() {
  const workspacePath = path.resolve(__dirname, '../pnpm-workspace.yaml');
  if (!fs.existsSync(workspacePath)) {
    console.warn('pnpm-workspace.yaml not found at root.');
    return;
  }

  let content = fs.readFileSync(workspacePath, 'utf8');
  if (!content.includes('apps/orgs/*')) {
    if (content.includes('packages:')) {
      content = content.replace('packages:', 'packages:\n  - \'apps/orgs/*\'');
      fs.writeFileSync(workspacePath, content, 'utf8');
      console.log('Added "apps/orgs/*" to pnpm-workspace.yaml');
    }
  }
}

function main() {
  const args = parseArgs();

  const slug = args['slug'];
  const tenantId = args['tenant-id'] || args['tenantId'];
  
  if (!slug) {
    console.error('Error: --slug <slug> is required.');
    process.exit(1);
  }

  if (!tenantId) {
    console.error('Error: --tenant-id <id> is required.');
    process.exit(1);
  }

  const slugRegex = /^[a-z0-9-]+$/;
  if (!slugRegex.test(slug)) {
    console.error('Error: --slug must be lowercase alphanumeric and hyphens only.');
    process.exit(1);
  }

  const name = args['name'] || slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  const apiUrl = args['api-url'] || '/api';
  const colorPrimary = args['color-primary'] || '#6366f1';
  const colorSecondary = args['color-secondary'] || '#8b5cf6';
  const fontFamily = args['font-family'] || 'Inter';

  const templateDir = path.resolve(__dirname, '../apps/orgs/_template');
  const targetDir = path.resolve(__dirname, `../apps/orgs/${slug}`);

  if (!fs.existsSync(templateDir)) {
    console.error(`Error: Reference template directory not found at ${templateDir}`);
    process.exit(1);
  }

  if (fs.existsSync(targetDir)) {
    console.error(`Error: Target directory already exists at ${targetDir}`);
    process.exit(1);
  }

  console.log(`Scaffolding new organization app: ${name}`);
  console.log(`Slug: ${slug}`);
  console.log(`Tenant ID: ${tenantId}`);
  console.log(`Target: ${targetDir}`);

  const replacements = {
    slug,
    tenantId,
    name,
    apiUrl,
    colorPrimary,
    colorSecondary,
    fontFamily
  };

  copyRecursiveSync(templateDir, targetDir, replacements);
  console.log('Template files copied and placeholders replaced successfully.');

  updateWorkspaceConfig();

  console.log('\nSuccess! App has been scaffolded.');
  console.log(`To register and link: pnpm install`);
  console.log(`To start dev server: pnpm --filter @campusos/org-${slug} run dev`);
}

main();
