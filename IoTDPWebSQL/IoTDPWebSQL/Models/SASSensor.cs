//------------------------------------------------------------------------------
// <auto-generated>
//     このコードはテンプレートから生成されました。
//
//     このファイルを手動で変更すると、アプリケーションで予期しない動作が発生する可能性があります。
//     このファイルに対する手動の変更は、コードが再生成されると上書きされます。
// </auto-generated>
//------------------------------------------------------------------------------

namespace IoTDPWebSQL.Models
{
    using System;
    using System.Collections.Generic;
    
    public partial class SASSensor
    {
        public string msgId { get; set; }
        public string deviceId { get; set; }
        public float temp { get; set; }
        public float brightness { get; set; }
        public float accelx { get; set; }
        public float accely { get; set; }
        public float accelz { get; set; }
        public System.DateTime time { get; set; }
        public Nullable<float> Longitude { get; set; }
        public Nullable<float> Latitude { get; set; }
    }
}
