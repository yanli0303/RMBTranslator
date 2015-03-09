using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;

namespace RMBTranslator
{
    #region -= Ref =-

    //汉字大写金额数字，一律用正楷字或行书字书写，如壹、贰、叁、肆、伍、陆、柒、捌、玖、拾、佰、仟、万、亿、圆（元）、角、分、零、整（正）
    //大写金额数字到元或角为止的，在“元”或“角”字之后应写“整”或“正”字；大写金额数字有分的，分字后面不写“整”字。
    //大写金额数字前未印有人民币字样的，应加填“人民币”三字，“人民币”三字与金额数字之间不得留有空白。
    //阿拉伯金额数字中间有“０”时，汉字大写金额要写“零”字，如¥１０１．５０，汉字大写金额应写成人民币壹佰零壹圆伍角整。
    //阿拉伯金额数字中间连续有几个“０”时，汉字大写金额中可以只写一个“零”字，如￥１，００４．５６，汉字大写金额应写成人民币壹仟零肆圆伍角陆分。
    //阿拉伯金额数字元位是“０”，或数字中间连续有几个“０”，元位也是“０”，但角位不是“０”时，汉字大写金额可只写一个“零”字，也可不写“零”字，
    //如¥１，３２０．５６，汉字大写金额应写成人民币壹仟叁佰贰拾圆零伍角陆分，或人民币壹仟叁佰贰拾圆伍角陆分。
    //又如¥１，０００．５６，汉字大写金额应写成人民币壹仟圆零伍角陆分，或人民币壹仟圆伍角陆分。

    #endregion

    public class RMB
    {
        private const string Zheng = "整";
        private static readonly char[] RMBDigits = { '零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖' };
        private static readonly string[] Units = { "分", "角", "圆", "拾", "佰", "仟", "万", "拾万", "佰万", "仟万", "亿", "拾亿", "佰亿", "仟亿", "万亿", "拾万亿", "佰万亿", "仟万亿" };

        #region -= Helper Meothods =-
        private static string GetArabString(decimal money)
        {
            return money.ToString("f2");
        }

        private static string GetChnString(string ArabString)
        {
            StringBuilder sb = new StringBuilder();
            foreach (char c in ArabString)
            {
                if (c == '-' || c == '.')
                    continue;

                int d = int.Parse(c.ToString());
                sb.Append(RMBDigits[d]);
            }

            return sb.ToString();
        }

        private static string GetChnString(decimal money)
        {
            string ArabString = money.ToString("f2");
            return GetChnString(ArabString);
        }

        private static bool IsChnZero(char digit)
        {
            return digit == RMBDigits[0];
        }
        #endregion

        private static string BasicTranslate(string piece)
        {
            if (string.IsNullOrEmpty(piece) || 4 < piece.Length)
                return string.Empty;

            int len = piece.Length;

            //玖仟玖佰玖十[玖]
            string ret = piece[len - 1].ToString();

            //玖仟玖佰[玖十]玖
            if (1 < len)
                ret = IsChnZero(piece[len - 2]) ? string.Concat(piece[len - 2], ret) : string.Concat(piece[len - 2], '拾', ret);

            //玖仟[玖佰]玖十玖
            if (2 < len)
                ret = IsChnZero(piece[len - 3]) ? string.Concat(piece[len - 3], ret) : string.Concat(piece[len - 3], '佰', ret);

            //[玖仟]玖佰玖十玖
            if (3 < len)
                ret = IsChnZero(piece[len - 4]) ? string.Concat(piece[len - 4], ret) : string.Concat(piece[len - 4], '仟', ret);

            return ret;
        }

        private static string DecimalTranslate(string decimalPart)
        {
            if (2 != decimalPart.Length)
                return string.Empty;

            bool zeroFen = IsChnZero(decimalPart[1]);
            bool zeroJiao = IsChnZero(decimalPart[0]);

            if (zeroJiao)
            {
                return zeroFen ? Zheng : string.Concat(decimalPart, '分');
            }
            else
            {
                if (zeroFen)
                    return string.Concat(decimalPart[0], '角', Zheng);
                else
                    return string.Concat(decimalPart[0], '角', decimalPart[1], '分');
            }
        }

        public static string Translate(decimal money)
        {
            string chn = GetChnString(money);
            if (chn.Length > 18)
                throw new ArgumentOutOfRangeException("money", money, "数额过大(大于 '玖仟万'), 无法处理.");

            StringBuilder output = new StringBuilder();
            string decimalPart = chn.Substring(chn.Length - 2);
            output.Append(DecimalTranslate(decimalPart));

            for (int i = chn.Length - 2; i > 0; i -= 4)
            {
                string digitsPiece = i < 4 ? chn.Substring(0, i) : chn.Substring(i - 4, 4);
                string chnPiece = BasicTranslate(digitsPiece);
                string unit = Units[chn.Length - i];
                output.Insert(0, chnPiece + unit);
            }

            //消除多余的零
            Regex redundantZero = new Regex(@"零+");
            string ret = redundantZero.Replace(output.ToString(), "零");

            //消除'零亿', '零万'之类的情况
            Regex zeroUnit = new Regex(@"零(?<zu>[圆万亿]|万亿)");
            return zeroUnit.Replace(ret, @"${zu}");
        }
    }
}
