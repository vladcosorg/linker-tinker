import Arborist from '@npmcli/arborist'
import packList from 'npm-packlist'

export async function getPackList(packageRoot: string): Promise<string[]> {
  const arborist = new Arborist({ path: packageRoot })
  return packList(await arborist.loadActual())
}
