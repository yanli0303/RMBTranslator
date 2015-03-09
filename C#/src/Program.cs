using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace RMBTranslator
{
    class Program
    {
        static void Main(string[] args)
        {
            string input = null;
            do
            {
                try
                {
                    Console.Write("输入要转换的金额, 或者直接回车退出: ");
                    input = Console.ReadLine();
                    if (input == string.Empty)
                        return;

                    decimal money = 0.0m;
                    if (!decimal.TryParse(input, out money))
                        Console.WriteLine("不能识别的金额.");
                    else
                        Console.WriteLine(RMB.Translate(money));
                }
                catch (ArgumentOutOfRangeException e)
                {
                    Console.WriteLine(e.Message);
                }

                Console.WriteLine();
            } 
            while (true);
        }
    }
}
