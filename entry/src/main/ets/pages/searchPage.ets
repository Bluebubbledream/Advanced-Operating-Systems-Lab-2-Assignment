import { fusionSearchService, SearchResult } from '../service/FusionSearchService';
@Entry
@Component
struct SearchPage {
  @State keyword: string = '';
  @State results: Array<SearchResult> = [];

  async onSearch() {
    this.results = await fusionSearchService.semanticSearch(this.keyword);
  }

  build() {
    Column() {
      Search({ placeholder: '输入搜索内容...', value: this.keyword })
        .width('90%')
        .margin(10)
        .onChange((value) => this.keyword = value)
        .onSubmit(() => this.onSearch())

      List() {
        ForEach(this.results, (item) => {
          ListItem() {
            Text(item.title)
              .fontSize(16)
              .padding(10)
          }
        })
      }
      .width('90%')
      .flexGrow(1)
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#f5f5f5')
  }
}

