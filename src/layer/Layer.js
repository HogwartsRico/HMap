import { ol } from '../constants'
import mix from '../utils/mixin'
import * as MapboxStyle from '../style/MapboxStyle'
import Style from '../style/Style'

class Layer extends mix(Style) {
  constructor (map) {
    super()
    this.map = map || null
    if (!this.map) {
      throw new Error('缺少地图对象！')
    }
  }

  /**
   * 通过layerName获取图层
   * @param layerName
   * @returns {*}
   */
  getLayerByLayerName (layerName) {
    try {
      let targetLayer = null
      if (this.map) {
        let layers = this.map.getLayers().getArray()
        layers.every(layer => {
          if (layer.get('layerName') === layerName) {
            targetLayer = layer
            return false
          } else {
            return true
          }
        })
      }
      return targetLayer
    } catch (e) {
      console.log(e)
    }
  }

  /**
   * 通过layerName获取专题图层
   * @param layerName
   * @returns {*}
   */
  getTitleLayerByLayerName (layerName) {
    try {
      let targetLayer = null
      if (this.map) {
        let layers = this.map.getLayers().getArray()
        layers.every(layer => {
          if (layer.get('layerType') === 'title' && layer.get('layerName') === layerName) {
            targetLayer = layer
            return false
          } else {
            return true
          }
        })
      }
      return targetLayer
    } catch (error) {
      console.log(error)
    }
  }

  /**
   * 根据图层名获取底图
   * @param layerName
   * @returns {*}
   */
  getBaseLayerByLayerName (layerName) {
    try {
      let currentLayer = null
      this.map.getLayers().getArray().forEach(layer => {
        if (layer && layer instanceof ol.layer.Group && layer.get('isBaseLayer')) {
          layer.getLayers().getArray().forEach(_layer => {
            if (_layer && _layer instanceof ol.layer.Tile && _layer.get('isBaseLayer') && _layer.get('layerName') === layerName) {
              currentLayer = _layer
            }
          })
        }
      })
      return currentLayer
    } catch (error) {
      console.log(error)
    }
  }

  /**
   * 获取底图图层组
   * @returns {*}
   */
  getBaseLayers () {
    try {
      let currentLayer = null
      this.map.getLayers().getArray().forEach(layer => {
        if (layer && layer instanceof ol.layer.Group && layer.get('isBaseLayer')) {
          currentLayer = layer
        }
      })
      return currentLayer
    } catch (error) {
      console.log(error)
    }
  }

  /**
   * 通过要素获取图层
   * @param feature
   * @returns {*}
   */
  getLayerByFeatuer (feature) {
    let tragetLayer = null
    if (this.map) {
      if (feature instanceof ol.Feature) {
        let layers = this.map.getLayers().getArray()
        layers.forEach(layer => {
          let source = layer.getSource()
          if (source.getFeatures) {
            let features = source.getFeatures()
            features.forEach(feat => {
              if (feat === feature) {
                tragetLayer = layer
              }
            })
          }
        })
      } else {
        throw new Error('传入的不是要素!')
      }
    }
    return tragetLayer
  }

  /**
   * 创建临时图层
   * @param layerName
   * @param params
   * @returns {*}
   */
  creatVectorLayer (layerName, params) {
    try {
      if (this.map) {
        let vectorLayer = this.getLayerByLayerName(layerName)
        if (!(vectorLayer instanceof ol.layer.Vector)) {
          vectorLayer = null
        }
        if (!vectorLayer) {
          if (params && params.create) {
            vectorLayer = new ol.layer.Vector({
              layerName: layerName,
              params: params,
              layerType: 'vector',
              source: new ol.source.Vector({
                wrapX: false
              }),
              style: new ol.style.Style({
                fill: new ol.style.Fill({
                  color: 'rgba(67, 110, 238, 0.4)'
                }),
                stroke: new ol.style.Stroke({
                  color: '#4781d9',
                  width: 2
                }),
                image: new ol.style.Circle({
                  radius: 7,
                  fill: new ol.style.Fill({
                    color: '#ffcc33'
                  })
                })
              })
            })
          }
        }
        if (this.map && vectorLayer) {
          if (params && params.hasOwnProperty('selectable')) {
            vectorLayer.set('selectable', params.selectable)
          }
          // 图层只添加一次
          let _vectorLayer = this.getLayerByLayerName(layerName)
          if (!_vectorLayer || !(_vectorLayer instanceof ol.layer.Vector)) {
            this.map.addLayer(vectorLayer)
          }
        }
        return vectorLayer
      }
    } catch (e) {
      console.log(e)
    }
  }

  /**
   * 创建热力图图层
   * @param layerName
   * @param params
   * @returns {string}
   */
  creatHeatMapLayer (layerName, params) {
    try {
      let currentLayer = null
      if (this.map) {
        currentLayer = this.getLayerByLayerName(layerName)
        if (!(currentLayer instanceof ol.layer.Heatmap)) {
          currentLayer = null
        } else if ((currentLayer instanceof ol.layer.Heatmap) && !(params['addLayer'] === false)) {
          this.map.removeLayer(currentLayer)
          currentLayer = null
        }
        if (!currentLayer && params && params['create']) {
          currentLayer = new ol.layer.Heatmap({
            layerName: layerName,
            gradient: (params['gradient'] ? params['gradient'] : ['#00f', '#0ff', '#0f0', '#ff0', '#f00']),
            source: new ol.source.Vector({
              wrapX: false,
              crossOrigin: (params['crossOrigin'] ? params['crossOrigin'] : undefined)
            }),
            blur: (params['blur'] ? params['blur'] : 15),
            radius: (params['radius'] ? params['radius'] : 8),
            shadow: (params['shadow'] ? params['shadow'] : 250),
            weight: (params['weight'] ? params['weight'] : 'weight'),
            extent: (params['extent'] ? params['extent'] : undefined),
            minResolution: (params['minResolution'] ? params['minResolution'] : undefined),
            maxResolution: (params['maxResolution'] ? params['maxResolution'] : undefined),
            opacity: (params['opacity'] ? params['opacity'] : 1),
            visible: ((params['visible'] === false) ? params['visible'] : true)
          })
          if (params && params.hasOwnProperty('selectable')) {
            currentLayer.set('selectable', params.selectable)
          }
        }
        if (currentLayer && !(params['addLayer'] === false)) {
          this.map.addLayer(currentLayer)
        }
        return currentLayer
      } else {
        throw new Error('未创建地图对象！')
      }
    } catch (error) {
      console.log(error)
    }
  }

  /**
   * 创建专题图层
   * @param layerName
   * @param params
   * @returns {*}
   */
  creatTitleLayer (layerName, params) {
    let ooLayer = null
    if (this.map) {
      let serviceUrl = params['serviceUrl']
      if (!serviceUrl) return null
      ooLayer = this.getTitleLayerByLayerName(layerName)
      if (ooLayer && ooLayer instanceof ol.layer.Tile && !(params['addLayer'] === false)) {
        this.map.removeLayer(ooLayer)
        ooLayer = null
      }
      if (!ooLayer && params['create']) {
        ooLayer = new ol.layer.Tile({
          layerName: layerName,
          layerType: 'title',
          visible: (params['visible'] === false) ? params['visible'] : true,
          source: new ol.source.TileArcGISRest({
            url: serviceUrl,
            crossOrigin: (params['crossOrigin'] ? params['crossOrigin'] : undefined),
            params: params,
            wrapX: false
          }),
          wrapX: false
        })
      }
      if (ooLayer && !(params['addLayer'] === false)) {
        this.map.addLayer(ooLayer)
      }
    }
    return ooLayer
  }

  /**
   * 创建ImageWMSLayer
   * @param layerName
   * @param params
   * @returns {string}
   */
  creatImageWMSLayer (layerName, params) {
    let layer = null
    if (this.map) {
      layer = this.getLayerByLayerName(layerName)
      if (!(layer instanceof ol.layer.Image)) {
        layer = null
      } else if ((layer instanceof ol.layer.Image) && !(params['addLayer'] === false)) {
        this.map.removeLayer(layer)
        layer = null
      }
      if (!layer && params && params['layerUrl'] && params['create']) {
        layer = new ol.layer.Image({
          layerName: layerName,
          visible: (params['visible'] === false) ? params['visible'] : true,
          opacity: (params['opacity'] && (typeof params['opacity'] === 'number')) ? params['opacity'] : 1,
          source: new ol.source.ImageWMS({
            url: params['layerUrl'],
            crossOrigin: (params['crossOrigin'] ? params['crossOrigin'] : undefined),
            params: {
              LAYERS: params['layers'], // require
              STYLES: params['style'] ? params['style'] : '',
              VERSION: params['version'] ? params['version'] : '1.3.0',
              WIDTH: params['width'] ? params['width'] : 256,
              HEIGHT: params['height'] ? params['height'] : 256,
              BBOX: params['bbox'], // require
              SRS: (params['srs'] ? params['srs'] : 'EPSG:3857'),
              CRS: (params['srs'] ? params['srs'] : 'EPSG:3857'),
              REQUEST: 'GetMap',
              TRANSPARENT: true,
              TILED: (params['tiled'] === false) ? params['tiled'] : true,
              TILESORIGIN: (params['tiledsorrigin'] ? params['tiledsorrigin'] : undefined),
              SERVICE: 'WMS',
              FORMAT: (params['format'] ? params['format'] : 'image/png')
            },
            wrapX: false
          })
        })
      }
      if (layer && !(params['addLayer'] === false)) {
        this.map.addLayer(layer)
      }
    }
    return layer
  }

  /**
   * 创建TileWMSLayer
   * @param layerName
   * @param params
   * @returns {string}
   */
  creatTileWMSLayer (layerName, params) {
    let layer = null
    if (this.map) {
      layer = this.getLayerByLayerName(layerName)
      if (!(layer instanceof ol.layer.Image)) {
        layer = null
      } else if ((layer instanceof ol.layer.Image) && !(params['addLayer'] === false)) {
        this.map.removeLayer(layer)
        layer = null
      }
      if (!layer && params && params['layerUrl'] && params['create']) {
        layer = new ol.layer.TileWMS({
          layerName: layerName,
          visible: (params['visible'] === false) ? params['visible'] : true,
          opacity: (params['opacity'] && (typeof params['opacity'] === 'number')) ? params['opacity'] : 1,
          source: new ol.source.ImageWMS({
            url: params['layerUrl'],
            crossOrigin: (params['crossOrigin'] ? params['crossOrigin'] : undefined),
            params: {
              LAYERS: params['layers'], // require
              STYLES: params['style'] ? params['style'] : '',
              VERSION: params['version'] ? params['version'] : '1.3.0',
              WIDTH: params['width'] ? params['width'] : 256,
              HEIGHT: params['height'] ? params['height'] : 256,
              BBOX: params['bbox'], // require
              SRS: (params['srs'] ? params['srs'] : 'EPSG:3857'),
              CRS: (params['srs'] ? params['srs'] : 'EPSG:3857'),
              REQUEST: 'GetMap',
              TRANSPARENT: true,
              TILED: ((params['tiled'] === false) ? params['tiled'] : true),
              TILESORIGIN: (params['tiledsorrigin'] ? params['tiledsorrigin'] : undefined),
              SERVICE: 'WMS',
              FORMAT: (params['format'] ? params['format'] : 'image/png')
            },
            wrapX: false
          })
        })
      }
      if (layer && !(params['addLayer'] === false)) {
        this.map.addLayer(layer)
      }
    }
    return layer
  }

  /**
   * 创建WFS图层
   * @param layerName
   * @param params
   * @returns {*}
   */
  creatWfsVectorLayer (layerName, params) {
    try {
      let vectorLayer = this.getLayerByLayerName(layerName)
      if (!(vectorLayer instanceof ol.layer.Vector)) {
        vectorLayer = null
      }
      if (!vectorLayer) {
        let proj = params['projection'] ? params['projection'] : 'EPSG:3857'
        let style = this.getStyleByParams(params['style'])
        vectorLayer = new ol.layer.Vector({
          layerName: layerName,
          params: params,
          layerType: 'vector',
          visible: (params['visible'] === false) ? params['visible'] : true,
          opacity: ((params['opacity'] && (typeof params['opacity'] === 'number')) ? params['opacity'] : 1),
          source: new ol.source.Vector({
            format: new ol.format.GeoJSON(),
            crossOrigin: (params['crossOrigin'] ? params['crossOrigin'] : undefined),
            url: function (extent) {
              return params['layerUrl'] + extent.join(',') + ',' + proj
            },
            wrapX: false,
            strategy: ol.loadingstrategy.bbox
          }),
          style: style
        })
      }
      if (this.map && vectorLayer) {
        if (params && params.hasOwnProperty('selectable')) {
          vectorLayer.set('selectable', params.selectable)
        }
        // 图层只添加一次
        let _vectorLayer = this.getLayerByLayerName(layerName)
        if (!_vectorLayer || !(_vectorLayer instanceof ol.layer.Vector)) {
          if (!(params['addLayer'] === false)) {
            this.map.addLayer(vectorLayer)
          }
        }
      }
      return vectorLayer
    } catch (e) {
      console.log(e)
    }
  }

  /**
   * 创建WMTS图层
   * @param layerName
   * @param params
   * @returns {*}
   */
  creatWMTSLayer (layerName, params) {
    try {
      let layer = this.getLayerByLayerName(layerName)
      if (!(layer instanceof ol.layer.Tile)) {
        layer = null
      } else if ((layer instanceof ol.layer.Tile) && !(params['addLayer'] === false)) {
        this.map.removeLayer(layer)
        layer = null
      }
      if (!layer && params && params['layerUrl'] && params['create'] && params['levels']) {
        let projection = ol.proj.get((params['projection'] ? params['projection'] : 'EPSG:3857'))
        let projectionExtent = projection.getExtent()
        let size = ol.extent.getWidth(projectionExtent) / 256
        let levels = params['levels']
        let resolutions = new Array(levels)
        let matrixIds = new Array(levels)
        for (let z = 0; z < levels; ++z) {
          // generate resolutions and matrixIds arrays for this WMTS
          resolutions[z] = size / Math.pow(2, z)
          matrixIds[z] = z
        }
        layer = new ol.layer.Tile({
          layerName: layerName,
          visible: (params['visible'] === false) ? params['visible'] : true,
          opacity: ((params['opacity'] && (typeof params['opacity'] === 'number')) ? params['opacity'] : 1),
          source: new ol.source.WMTS({
            url: params['layerUrl'],
            layer: (params['layer'] ? params['layer'] : '0'),
            matrixSet: (params['matrixSet'] ? params['matrixSet'] : 'EPSG:3857'),
            format: (params['format'] ? params['format'] : 'image/png'),
            crossOrigin: (params['crossOrigin'] ? params['crossOrigin'] : undefined),
            projection: projection,
            tileGrid: new ol.tilegrid.WMTS({
              origin: ol.extent.getTopLeft(projectionExtent),
              resolutions: resolutions,
              matrixIds: matrixIds,
              version: (params['version'] ? params['version'] : '1.0.0'),
              dimensions: (params['dimensions'] ? params['dimensions'] : undefined)
            }),
            style: (params['style'] ? params['style'] : 'default'),
            wrapX: false
          })
        })
      }
      if (layer && !(params['addLayer'] === false)) {
        this.map.addLayer(layer)
      }
      return layer
    } catch (e) {
      console.log(e)
    }
  }

  /**
   * 创建XYZ图层
   * @param layerName
   * @param params
   * @returns {*}
   */
  creatXYZLayer (layerName, params) {
    try {
      let layer = this.getLayerByLayerName(layerName)
      if (!(layer instanceof ol.layer.Tile)) {
        layer = null
      } else if ((layer instanceof ol.layer.Tile) && !(params['addLayer'] === false)) {
        this.map.removeLayer(layer)
        layer = null
      }
      if (!layer && params && params['layerUrl'] && params['create']) {
        let tileGrid = null
        if (params['tileGrid'] && params['tileGrid']['resolutions']) {
          tileGrid = new ol.tilegrid.TileGrid({
            tileSize: (params['tileGrid']['tileSize'] ? params['tileGrid']['tileSize'] : 256),
            origin: (params['tileGrid']['origin'] ? params['tileGrid']['origin'] : undefined),
            extent: (params['tileGrid']['extent'] ? params['tileGrid']['extent'] : undefined),
            resolutions: params['tileGrid']['resolutions'],
            minZoom: ((params['tileGrid']['minZoom'] && typeof params['tileGrid']['minZoom'] === 'number') ? params['tileGrid']['minZoom'] : 0)
          })
        }
        layer = new ol.layer.Tile({
          layerName: layerName,
          visible: (params['visible'] === false) ? params['visible'] : true,
          opacity: ((params['opacity'] && (typeof params['opacity'] === 'number')) ? params['opacity'] : 1),
          source: new ol.source.XYZ({
            wrapX: false,
            tileGrid: ((tileGrid && tileGrid instanceof ol.tilegrid.TileGrid) ? tileGrid : undefined),
            tileSize: (params['tileSize'] ? params['tileSize'] : 256),
            opaque: (params['opaque'] === true) ? params['opaque'] : false, // 图层是否不透明（主题相关）
            tilePixelRatio: (params['tilePixelRatio'] ? params['tilePixelRatio'] : 1), // todo 对于高分辨率设备，例如苹果等可能2、3（移动端开发需要注意）
            projection: (params['projection'] ? params['projection'] : 'EPSG:3857'),
            maxZoom: (params['maxZoom'] ? params['maxZoom'] : 18),
            minZoom: (params['minZoom'] ? params['minZoom'] : 0),
            crossOrigin: (params['crossOrigin'] ? params['crossOrigin'] : undefined),
            tileUrlFunction: function (tileCoord) {
              let url = (params['layerUrl']).replace('{z}',
                (tileCoord[0]).toString()).replace('{x}',
                tileCoord[1].toString()).replace('{y}',
                (-tileCoord[2] - 1).toString())
              return url
            }
          })
        })
      }
      if (layer && !(params['addLayer'] === false)) {
        this.map.addLayer(layer)
      }
      return layer
    } catch (e) {
      console.log(e)
    }
  }

  /**
   * 创建OSM图层
   * @param layerName
   * @param params
   * @returns {*}
   */
  creatOSMLayer (layerName, params) {
    try {
      let layer = this.getLayerByLayerName(layerName)
      if (!(layer instanceof ol.layer.Tile)) {
        layer = null
      } else if ((layer instanceof ol.layer.Tile) && !(params['addLayer'] === false)) {
        this.map.removeLayer(layer)
        layer = null
      }
      if (!layer && params['create']) {
        layer = new ol.layer.Tile({
          layerName: layerName,
          visible: (params['visible'] === false) ? params['visible'] : true,
          opacity: ((params['opacity'] && (typeof params['opacity'] === 'number')) ? params['opacity'] : 1),
          source: new ol.source.OSM({
            wrapX: false,
            opaque: (params['opaque'] === false) ? params['opaque'] : true, // 图层是否不透明（主题相关）
            url: params['layerUrl'] ? params['layerUrl'] : 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            crossOrigin: (params['crossOrigin'] ? params['crossOrigin'] : undefined)
          })
        })
      }
      if (layer && !(params['addLayer'] === false)) {
        this.map.addLayer(layer)
      }
      return layer
    } catch (e) {
      console.log(e)
    }
  }

  /**
   * 创建Mapbox矢量图层
   * @param layerName
   * @param params
   * @returns {*}
   */
  creatMapboxVectorTileLayer (layerName, params) {
    try {
      let layer = this.getLayerByLayerName(layerName)
      if (!(layer instanceof ol.layer.Tile)) {
        layer = null
      } else if ((layer instanceof ol.layer.Tile) && !(params['addLayer'] === false)) {
        this.map.removeLayer(layer)
        layer = null
      }
      if (!layer && params && params['layerUrl'] && params['create']) {
        let tileGrid = null
        if (params['tileGrid']) {
          /* eslint new-cap: ["error", { "newIsCap": false }] */
          tileGrid = new ol.tilegrid.createXYZ({
            tileSize: (params['tileGrid']['tileSize'] ? params['tileGrid']['tileSize'] : 256),
            extent: (params['tileGrid']['extent'] ? params['tileGrid']['extent'] : undefined),
            minZoom: ((params['tileGrid']['minZoom'] && typeof params['tileGrid']['minZoom'] === 'number') ? params['tileGrid']['minZoom'] : 0),
            maxZoom: ((params['tileGrid']['maxZoom'] && typeof params['tileGrid']['maxZoom'] === 'number') ? params['tileGrid']['maxZoom'] : 22)
          })
        }
        layer = new ol.layer.VectorTile({
          visible: (params['visible'] === false) ? params['visible'] : true,
          renderBuffer: ((params['renderBuffer'] && (typeof params['renderBuffer'] === 'number')) ? params['renderBuffer'] : 100),
          renderMode: (params['renderMode'] ? params['renderMode'] : 'hybrid'), // 渲染方式image，hybrid，vector，性能由高到低
          extent: (params['extent'] ? params['extent'] : undefined),
          opacity: ((params['opacity'] && (typeof params['opacity'] === 'number')) ? params['opacity'] : 1),
          minResolution: ((params['minResolution'] && typeof params['minResolution'] === 'number') ? params['minResolution'] : undefined),
          maxResolution: ((params['maxResolution'] && typeof params['maxResolution'] === 'number') ? params['maxResolution'] : undefined),
          preload: ((params['preload'] && typeof params['preload'] === 'number') ? params['preload'] : 0),
          source: new ol.source.VectorTile({
            format: new ol.format.MVT(),
            crossOrigin: (params['crossOrigin'] ? params['crossOrigin'] : undefined),
            projection: (params['projection'] ? params['projection'] : 'EPSG:3857'),
            overlaps: (params['overlaps'] ? params['overlaps'] : true),
            tileGrid: ((tileGrid && tileGrid instanceof ol.tilegrid.TileGrid) ? tileGrid : undefined),
            tilePixelRatio: ((params['tilePixelRatio'] && typeof params['tilePixelRatio'] === 'number') ? params['tilePixelRatio'] : 1),
            url: params['layerUrl'],
            wrapX: false
          }),
          style: MapboxStyle.createMapboxStreetsV6Style()
        })
      }
      if (layer && !(params['addLayer'] === false)) {
        this.map.addLayer(layer)
      }
      return layer
    } catch (e) {
      console.log(e)
    }
  }

  /**
   * 移除图层
   * @param layerName
   */
  removeLayerByLayerName (layerName) {
    if (this.map) {
      let layer = this.getLayerByLayerName(layerName)
      if (layer && layer instanceof ol.layer.Vector && layer.getSource() && layer.getSource().clear) {
        layer.getSource().clear()
      }
    }
  }

  /**
   * 通过layerName移除专题图层
   * @param layerName
   */
  removeTileLayerByLayerName (layerName) {
    if (this.map) {
      let layer = this.getTitleLayerByLayerName(layerName)
      if (layer && layer instanceof ol.layer.Tile) {
        this.map.removeLayer(layer)
      }
    }
  }

  /**
   * 移除所有图层（除底图）
   */
  removeAllLayer () {
    if (this.map) {
      let layers = this.map.getLayers().getArray()
      layers.forEach(layer => {
        if (!layer.get('isBaseLayer')) {
          this.map.removeLayer(layer)
        }
      })
    }
  }
}

export default Layer
