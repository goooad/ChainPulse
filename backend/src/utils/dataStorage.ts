import fs from 'fs/promises'
import path from 'path'

export class DataStorageUtils {
  private static readonly DATA_DIR = path.join(process.cwd(), 'data')
  private static readonly CACHE_DIR = path.join(this.DATA_DIR, 'cache')

  /**
   * 确保目录存在
   */
  private static async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await fs.access(dirPath)
    } catch {
      await fs.mkdir(dirPath, { recursive: true })
    }
  }


  /**
   * 保存 NFT 数据到文件（按关键词保存，覆盖旧文件）
   */
  static async saveNFTDataToFile(data: any, nftKeyword: string): Promise<string> {
    try {
      await this.ensureDirectoryExists(this.CACHE_DIR)
      
      const filename = `nft-${nftKeyword.replace(/[^a-zA-Z0-9]/g, '_')}.json`
      const filepath = path.join(this.CACHE_DIR, filename)
      
      const dataToSave = {
        nftKeyword,
        lastUpdated: new Date().toISOString(),
        data: data,
        metadata: {
          total_tweets: data.tweets?.length || 0,
          saved_at: new Date().toISOString(),
          api_source: data.isMockData ? 'mock' : 'real'
        }
      }

      await fs.writeFile(filepath, JSON.stringify(dataToSave, null, 2), 'utf-8')
      
      console.log(`✅ NFT 数据已保存到文件: ${filename}`)
      return filename
    } catch (error) {
      console.error('❌ 保存 NFT 数据失败:', error)
      throw error
    }
  }

  /**
   * 从文件读取 NFT 数据
   */
  static async loadNFTDataFromFile(nftKeyword: string): Promise<any | null> {
    try {
      const filename = `nft-${nftKeyword.replace(/[^a-zA-Z0-9]/g, '_')}.json`
      const filepath = path.join(this.CACHE_DIR, filename)
      
      const fileContent = await fs.readFile(filepath, 'utf-8')
      const savedData = JSON.parse(fileContent)
      
      console.log(`✅ 从文件读取 NFT 数据: ${filename}`)
      return savedData.data
    } catch (error) {
      console.log(`📁 NFT 缓存文件不存在: nft-${nftKeyword.replace(/[^a-zA-Z0-9]/g, '_')}.json`)
      return null
    }
  }



  /**
   * 获取缓存文件列表
   */
  static async getCacheFiles(prefix?: string): Promise<string[]> {
    try {
      await this.ensureDirectoryExists(this.CACHE_DIR)
      
      const files = await fs.readdir(this.CACHE_DIR)
      let filteredFiles = files.filter(file => file.endsWith('.json'))
      
      if (prefix) {
        filteredFiles = filteredFiles.filter(file => file.startsWith(prefix))
      }
      
      return filteredFiles.sort((a, b) => b.localeCompare(a))
    } catch (error) {
      console.error('❌ 获取缓存文件列表失败:', error)
      return []
    }
  }
}