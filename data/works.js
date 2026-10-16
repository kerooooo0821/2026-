// All media paths are local so index.html also works from file://.
const sectionTypes = [
  ['ad', '广告图', 'Advertising'],
  ['store', '商店图', 'Store Screens'],
  ['pinned', '置顶图', 'Pinned'],
  ['gameplay', '玩法图', 'Gameplay'],
  ['videos', '买量视频', 'Videos']
];

const projectData = [
  {
    id: 'project-01-max', title: 'Mad Survivor: Arid Warfire', bgColor: '#241f1b',
    thumb: 'assets/works/project-01-max/thumb.webp', icon: 'assets/works/project-01-max/icon.webp',
    description: '末日求生题材模拟策略游戏。围绕荒漠世界与生存玩法，呈现广告及商店视觉素材。',
    coverCopy: { title: 'MAD SURVIVOR: ARID WARFIRE', subtitle: '疯狂生还者:荒漠战火', intro: '末日求生题材模拟策略游戏', keywords: '荒漠/灾害/末世/生存/废土/资源争夺/写实/SLG' },
    media: {
      ad: [
        { src: 'ad-01.webp', caption: 'MAX-沙尘暴-gameplay-建造' },
        { src: 'ad-02.webp', caption: 'MAX-经典片段' },
        { src: 'ad-03.webp', caption: 'MAX-氛围图' }
      ],
      store: [
        { src: 'store-01.webp', caption: 'MAX-干旱-gameplay-建造' },
        { src: 'store-02.webp', caption: 'MAX-gameplay-战斗' }
      ]
    }
  },
  {
    id: 'project-02', title: 'Marsaction: Infinite Ambition', bgColor: '#1c1f24',
    thumb: 'assets/works/project-02-mia/thumb.webp', icon: 'assets/works/project-02-mia/icon.webp',
    description: '火星机甲战争题材的模拟策略游戏。',
    coverCopy: { title: 'MARSACTION: INFINITE AMBITION', subtitle: '火星行动:无尽雄心', intro: '火星机甲战争题材的模拟策略游戏', keywords: '新纪元/火星殖民/虫群突变/星际异虫/机甲/科幻/写实/SLG' },
    media: {
      ad: [
        { src: 'ad-01.webp', caption: 'MIA-氛围-虫卵' },
        { src: 'ad-02.webp', caption: 'MIA-氛围-实验室' },
        { src: 'ad-03.webp', caption: 'MIA-氛围-灾害' },
        { src: 'ad-04.webp', caption: 'MIA-战斗-虫族' },
        { src: 'ad-05.webp', caption: 'MIA-战斗-虫族' },
        { src: 'ad-06.webp', caption: 'MIA-氛围-营救' }
      ],
      store: [
        {
          setId: 'set-01',
          images: [
            { src: 'set-01/solo-store-01.webp', role: 'solo', caption: 'MIA-基地展示' },
            { src: 'set-01/solo-store-02.webp', role: 'solo', caption: 'MIA-战斗-虫族' },
            { src: 'set-01/team-store-01.webp', role: 'team', caption: '' },
            { src: 'set-01/team-store-02.webp', role: 'team', caption: '' },
            { src: 'set-01/team-store-03.webp', role: 'team', caption: '' }
          ]
        },
        {
          setId: 'extras',
          images: [
            { src: 'extra-store-01.webp', role: 'none', caption: 'MIA-基地展示' },
            { src: 'extra-store-02.webp', role: 'none', caption: 'MIA-清理-虫卵' }
          ]
        }
      ]
    }
  },
  {
    id: 'project-03', title: 'West Game', bgColor: '#241f1b',
    thumb: 'assets/works/project-03-wg/thumb.webp', icon: 'assets/works/project-03-wg/icon.webp',
    description: '热血西部题材的模拟策略游戏。',
    coverCopy: { title: 'West Game', subtitle: '西部风云', intro: '热血西部题材的模拟策略游戏', keywords: '美国西部拓荒/荒漠/牛仔/生存/写实/SLG' },
    media: {
      ad: [
        { src: 'ad-01.webp', caption: 'WG-火车-战斗' },
        { src: 'ad-02.webp', caption: 'WG-第三人称-战斗' }
      ],
      store: [{
        setId: 'set-01',
        images: [
          { src: 'set-01/solo-store-01.webp', role: 'solo', caption: 'WG-氛围-战斗' },
          { src: 'set-01/solo-store-02.webp', role: 'solo', caption: 'WG-战斗-酒馆' },
          { src: 'set-01/team-store-01.webp', role: 'team', caption: '' },
          { src: 'set-01/team-store-02.webp', role: 'team', caption: '' },
          { src: 'set-01/team-store-03.webp', role: 'team', caption: '' }
        ]
      }]
    }
  },
  {
    id: 'project-04', title: 'Critter Colonies', bgColor: '#22251f',
    thumb: 'assets/works/project-04-pkm/thumb.webp', icon: 'assets/works/project-04-pkm/icon.webp',
    description: '奇幻宠物题材的模拟策略游戏。',
    coverCopy: { title: 'CRITTER COLONIES', subtitle: '奇兽部落', intro: '奇幻宠物题材的模拟策略游戏', keywords: '未来世界/宠物收集/卡通/SLG' },
    media: {
      ad: [
        { src: 'ad-01.webp', caption: 'CC-氛围-夜晚' },
        { src: 'ad-02.webp', caption: 'CC-氛围' }
      ],
      pinned: [
        { src: 'pinned-01.webp', caption: '' },
        { src: 'pinned-02.webp', caption: '' }
      ],
      gameplay: [
        { setId: 'set-01', caption: '轻度休闲玩法：子弹反弹', images: [{ src: 'set-01/01.webp', caption: '' }] },
        { setId: 'set-02', caption: '轻度休闲玩法：割绳子', images: [{ src: 'set-02/01.webp', caption: '' }, { src: 'set-02/02.webp', caption: '' }] },
        { setId: 'set-03', caption: '轻度探索：开放世界', images: [{ src: 'set-03/01.webp', caption: '' }, { src: 'set-03/02.webp', caption: '' }] },
        { setId: 'set-04', caption: '轻度休闲玩法：色块开车', images: [{ src: 'set-04/01.webp', caption: '' }, { src: 'set-04/02.webp', caption: '' }] },
        { setId: 'set-05', caption: '轻度休闲玩法：丢钩子', images: [{ src: 'set-05/01.webp', caption: '' }, { src: 'set-05/02.webp', caption: '' }] }
      ]
    }
  },
  {
    id: 'project-05', title: 'Mecha Fire', bgColor: '#1c1f24',
    thumb: 'assets/works/project-05-p6/thumb.webp', icon: 'assets/works/project-05-p6/icon.webp',
    description: '火星机甲战争题材的模拟策略游戏。',
    coverCopy: { title: 'Mecha Fire', subtitle: '机甲战火', intro: '火星机甲战争题材的模拟策略游戏', keywords: '新纪元/火星殖民/虫群威胁/缺氧/生存压力/机甲/科幻/卡通/SLG' },
    media: {
      store: [{
        setId: 'set-01',
        images: [
          { src: 'set-01/solo-store-01.webp', role: 'solo', caption: 'MF-缺氧-建造' },
          { src: 'set-01/team-store-01.webp', role: 'team', caption: '' },
          { src: 'set-01/team-store-02.webp', role: 'team', caption: '' },
          { src: 'set-01/team-store-03.webp', role: 'team', caption: '' }
        ]
      }],
      pinned: [{ src: 'pinned-01.webp', caption: '' }],
      gameplay: [{ setId: 'set-01', caption: '轻度休闲玩法：色块飞船', images: [{ src: 'set-01/01.webp', caption: '' }, { src: 'set-01/02.webp', caption: '' }] }],
      videos: [
        { src: 'https://gamevideoly-1507540824.cos.ap-guangzhou.myqcloud.com/works/project-05-p6/videos/01.mp4', poster: 'assets/works/project-05-p6/videos/01-poster.webp', caption: '休闲玩法-弹珠爽点' },
        { src: 'https://gamevideoly-1507540824.cos.ap-guangzhou.myqcloud.com/works/project-05-p6/videos/02.mp4', poster: 'assets/works/project-05-p6/videos/02-poster.webp', caption: '缺氧压力-人虫大战' },
        { src: 'https://gamevideoly-1507540824.cos.ap-guangzhou.myqcloud.com/works/project-05-p6/videos/03.mp4', poster: 'assets/works/project-05-p6/videos/03-poster.webp', caption: '缺氧压力-建设氛围' },
        { src: 'https://gamevideoly-1507540824.cos.ap-guangzhou.myqcloud.com/works/project-05-p6/videos/04.mp4', poster: 'assets/works/project-05-p6/videos/04-poster.webp', caption: '缺氧压力-红警' },
        { src: 'https://gamevideoly-1507540824.cos.ap-guangzhou.myqcloud.com/works/project-05-p6/videos/05.mp4', poster: 'assets/works/project-05-p6/videos/05-poster.webp', caption: '战斗氛围' }
      ]
    }
  },
  {
    id: 'project-06', title: 'West Game II', bgColor: '#241f1b',
    thumb: 'assets/works/project-06-p9/thumb.webp', icon: 'assets/works/project-06-p9/icon.webp',
    description: '热血西部题材的模拟策略游戏。',
    coverCopy: { title: 'West Game II', subtitle: '西部风云 II', intro: '热血西部题材的模拟策略游戏', keywords: '美国西部拓荒/荒漠/牛仔/生存/写实/SLG' },
    media: {
      store: [
        { src: 'store-01.webp', caption: 'WGⅡ-gameplay-建造' },
        { src: 'store-02.webp', caption: 'WGⅡ-gameplay-战斗' }
      ],
      gameplay: [{ setId: 'set-01', caption: '轻度益智玩法：移动箱子', images: [{ src: 'set-01/01.webp', caption: '' }, { src: 'set-01/02.webp', caption: '' }, { src: 'set-01/03.webp', caption: '' }] }],
      videos: [
        { src: 'https://gamevideoly-1507540824.cos.ap-guangzhou.myqcloud.com/works/project-06-p9/videos/01.mp4', poster: 'assets/works/project-06-p9/videos/01-poster.webp', caption: '西部-开放世界-卷羊毛' },
        { src: 'https://gamevideoly-1507540824.cos.ap-guangzhou.myqcloud.com/works/project-06-p9/videos/02.mp4', poster: 'assets/works/project-06-p9/videos/02-poster.webp', caption: '西部-迭代开放世界-卷羊毛' },
        { src: 'https://gamevideoly-1507540824.cos.ap-guangzhou.myqcloud.com/works/project-06-p9/videos/03.mp4', poster: 'assets/works/project-06-p9/videos/03-poster.webp', caption: '西部-逃离鸭科夫' }
      ]
    }
  },
  {
    id: 'project-07', title: 'Kingdom Fall: Zombie Defense', bgColor: '#1d2524',
    thumb: 'assets/works/project-07-p11/thumb.webp', icon: 'assets/works/project-07-p11/icon.webp',
    description: '末日丧尸题材的模拟策略游戏。',
    coverCopy: { title: 'Kingdom Fall: Zombie Defense', subtitle: '王国陷落：僵尸防御', intro: '末日丧尸题材的模拟策略游戏', keywords: '中世纪/末日/丧尸/Thronefall式塔防/高空避难所/卡通/SLG' },
    media: {
      videos: [
        { src: 'https://gamevideoly-1507540824.cos.ap-guangzhou.myqcloud.com/works/project-07-p11/videos/01.mp4', poster: 'assets/works/project-07-p11/videos/01-poster.webp', caption: 'Banished-高空建造' },
        { src: 'https://gamevideoly-1507540824.cos.ap-guangzhou.myqcloud.com/works/project-07-p11/videos/02.mp4', poster: 'assets/works/project-07-p11/videos/02-poster.webp', caption: 'Banished-建造' },
        { src: 'https://gamevideoly-1507540824.cos.ap-guangzhou.myqcloud.com/works/project-07-p11/videos/03.mp4', poster: 'assets/works/project-07-p11/videos/03-poster.webp', caption: 'SLG-上帝之手' },
        { src: 'https://gamevideoly-1507540824.cos.ap-guangzhou.myqcloud.com/works/project-07-p11/videos/04.mp4', poster: 'assets/works/project-07-p11/videos/04-poster.webp', caption: '4X-建造' },
        { src: 'https://gamevideoly-1507540824.cos.ap-guangzhou.myqcloud.com/works/project-07-p11/videos/05.mp4', poster: 'assets/works/project-07-p11/videos/05-poster.webp', caption: '搜打撤-丧尸' }
      ]
    }
  },
  {
    id: 'project-08', title: 'AIGC', bgColor: '#241f1b',
    thumb: 'assets/works/project-08-ai/thumb.webp', icon: 'assets/works/project-08-ai/icon.webp',
    description: 'AI作品合集。',
    coverCopy: { title: 'AIGC', intro: 'AI作品合集' },
    media: {
      ad: [
        { setId: 'type-01', layout: 'image-grid', images: [
          { src: 'type-01/01.webp', caption: 'AI-战斗氛围图' }
        ] },
        { setId: 'type-02', layout: 'image-grid', images: [
          { src: 'type-02/01.webp', caption: 'AI-海上油田' },
          { src: 'type-02/02.webp', caption: 'AI-海上油田' }
        ] },
        { setId: 'type-03', layout: 'image-grid', images: [
          { src: 'type-03/01.webp', caption: 'AI-酒馆' },
          { src: 'type-03/02.webp', caption: 'AI-西部美女' }
        ] },
        { setId: 'type-04', layout: 'image-grid', images: [
          { src: 'type-04/01.webp', caption: 'AI-西部建造' }
        ] }
      ],
      videos: [
        { src: 'https://gamevideoly-1507540824.cos.ap-guangzhou.myqcloud.com/works/project-08-ai/videos/01.mp4', poster: 'assets/works/project-08-ai/videos/01-poster.webp', caption: 'AI-真人-伐木职业口播' },
        { src: 'https://gamevideoly-1507540824.cos.ap-guangzhou.myqcloud.com/works/project-08-ai/videos/02.mp4', poster: 'assets/works/project-08-ai/videos/02-poster.webp', caption: 'AI-第一视角互动' },
        { src: 'https://gamevideoly-1507540824.cos.ap-guangzhou.myqcloud.com/works/project-08-ai/videos/03.mp4', poster: 'assets/works/project-08-ai/videos/03-poster.webp', caption: 'AI-西部-开放世界' }
      ]
    }
  }
];

window.WORKS = projectData.map((project) => {
  const { media, ...details } = project;
  const directory = project.thumb.slice(0, project.thumb.lastIndexOf('/'));
  return {
    category: '游戏视觉 / Game Visuals', tags: ['游戏视觉', '买量设计'], role: '视觉设计',
    ...details,
    sections: sectionTypes.map(([key, title, en]) => ({
      key, title, en,
      items: (media[key] || []).map((entry, index) => {
        if (key === 'videos' && entry && typeof entry === 'object' && entry.src) {
          return {
            src: entry.src,
            poster: entry.poster || '',
            caption: typeof entry.caption === 'string' ? entry.caption.trim() : '',
            type: 'video'
          };
        }
        if (entry && Array.isArray(entry.images)) {
          return {
            type: entry.layout === 'image-grid' ? 'image-set' : key === 'gameplay' ? 'gameplay-set' : entry.setId === 'extras' ? 'extras' : 'set',
            id: entry.setId,
            caption: entry.caption || '',
            items: entry.images.map((image, imageIndex) => ({
              src: `${directory}/${key}/${typeof image === 'string' ? image : image.src}`,
              caption: typeof image === 'object' && typeof image.caption === 'string' ? image.caption.trim() : '',
              showCaption: typeof image === 'object' && typeof image.caption === 'string' && Boolean(image.caption.trim()),
              type: 'image',
              role: typeof image === 'string' ? undefined : image.role
            }))
          };
        }
        return {
          src: `${directory}/${key}/${typeof entry === 'string' ? entry : entry.src}`,
          caption: typeof entry === 'object' && typeof entry.caption === 'string' ? entry.caption.trim() : '',
          showCaption: typeof entry === 'object' && typeof entry.caption === 'string' && Boolean(entry.caption.trim()),
          type: key === 'videos' ? 'video' : 'image'
        };
      })
    }))
  };
});
